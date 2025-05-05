const express = require('express');
const admin = require('../config/firebase');
const User = require('../models/user');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Validações
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }
  if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um número' });
  }
  if (name.length < 2) {
    return res.status(400).json({ error: 'O nome deve ter pelo menos 2 caracteres' });
  }

  try {
    // Verifica se o email já está registrado
    await admin.auth().getUserByEmail(email);
    return res.status(400).json({ error: 'Email já registrado' });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      return res.status(400).json({ error: `Erro ao verificar email: ${error.message}` });
    }
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    const user = new User(userRecord.uid, email, name);
    await admin.database().ref(`users/${userRecord.uid}`).set(user.toJSON());
    return res.status(201).json({ message: 'Usuário registrado com sucesso', uid: userRecord.uid });
  } catch (error) {
    return res.status(400).json({ error: `Erro ao registrar: ${error.message}` });
  }
});

router.post('/login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Token não fornecido' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
    if (!userData) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados' });
    }
    return res.status(200).json({
      message: 'Login bem-sucedido',
      uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      is_premium: userData.is_premium
    });
  } catch (error) {
    return res.status(401).json({ error: `Erro ao verificar token: ${error.message}` });
  }
});

module.exports = router;