const express = require('express');
const admin = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const checkAdmin = async (uid) => {
  const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
  return userData && userData.role === 'admin';
};

router.post('/set_role', authenticateToken, async (req, res) => {
  const { uid, role, is_premium = false } = req.body;
  const requesterUid = req.user.uid;

  if (!await checkAdmin(requesterUid)) {
    return res.status(403).json({ error: 'Apenas admin pode alterar papéis' });
  }

  try {
    await admin.database().ref(`users/${uid}`).update({ role, is_premium });
    await admin.auth().setCustomUserClaims(uid, { role, is_premium });
    return res.status(200).json({ message: 'Papel atualizado com sucesso' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();
    
    if (!userData) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    return res.status(200).json({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      is_premium: userData.is_premium
    });
  } catch (error) {
    return res.status(500).json({ error: `Erro ao obter perfil: ${error.message}` });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  console.log('Requisição para atualizar perfil:', { user: req.user, body: req.body });
  const { name } = req.body;
  
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Nome inválido (mínimo 2 caracteres)' });
  }
  
  if (!req.user || !req.user.uid) {
    console.error('UID não encontrado no token:', req.user);
    return res.status(401).json({ error: 'Token de autenticação inválido' });
  }
  
  try {
    const uid = req.user.uid;
    console.log(`Atualizando perfil para o usuário: ${uid}, novo nome: ${name}`);
    
    // Verifica se o usuário existe
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    if (!userSnapshot.exists()) {
      console.error(`Usuário não encontrado: ${uid}`);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Atualiza apenas o nome
    await admin.database().ref(`users/${uid}`).update({ name });
    console.log(`Perfil atualizado com sucesso para: ${uid}`);
    
    return res.status(200).json({ 
      message: 'Perfil atualizado com sucesso',
      user: {
        name,
        ...userSnapshot.val(),
        // Garante que o nome reflete a atualização
        name: name
      }
    });
  } catch (error) {
    console.error(`Erro ao atualizar perfil: ${error.message}`, error);
    return res.status(500).json({ error: `Erro ao atualizar perfil: ${error.message}` });
  }
});

module.exports = router;