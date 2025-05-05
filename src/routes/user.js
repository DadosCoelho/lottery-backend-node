const express = require('express');
const admin = require('../config/firebase');
const requireAuth = require('../middleware/auth');
const router = express.Router();

const checkAdmin = async (uid) => {
  const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
  return userData && userData.role === 'admin';
};

router.post('/set_role', requireAuth, async (req, res) => {
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

router.get('/profile', requireAuth, async (req, res) => {
  const uid = req.user.uid;
  const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
  if (!userData) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  return res.status(200).json({
    uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    is_premium: userData.is_premium
  });
});

router.put('/profile', requireAuth, async (req, res) => {
  const { name } = req.body;
  const uid = req.user.uid;

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'O nome deve ter pelo menos 2 caracteres' });
  }

  try {
    await admin.database().ref(`users/${uid}`).update({ name });
    return res.status(200).json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    return res.status(400).json({ error: `Erro ao atualizar perfil: ${error.message}` });
  }
});

module.exports = router;