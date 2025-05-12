const express = require('express');
const admin = require('../config/firebase');
const GroupBet = require('../models/groupBet');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Criar novo bolão
router.post('/create', authenticateToken, async (req, res) => {
  const { name, modality, numbers, clovers, initial_contest, final_contest, max_members } = req.body;
  const uid = req.user.uid;

  try {
    // Verificar se o usuário existe e é premium
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    const user = userSnapshot.val();
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (!user.is_premium) {
      return res.status(403).json({ error: 'Apenas usuários premium podem criar bolões' });
    }

    // Validar dados do bolão
    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'Nome do bolão deve ter pelo menos 3 caracteres' });
    }

    // Criar bolão
    const newGroupBet = new GroupBet(
      null, // id será gerado pelo Firebase
      name,
      uid,
      modality,
      numbers,
      clovers || [],
      initial_contest,
      final_contest,
      max_members || 10,
      [uid], // membros iniciais (criador)
      new Date().toISOString()
    );

    const groupBetRef = await admin.database().ref('group_bets').push(newGroupBet.toJSON());
    
    return res.status(201).json({
      message: 'Bolão criado com sucesso',
      group_bet_id: groupBetRef.key,
      group_bet: newGroupBet.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ error: `Erro ao criar bolão: ${error.message}` });
  }
});

// Entrar em um bolão
router.post('/join/:id', authenticateToken, async (req, res) => {
  const groupBetId = req.params.id;
  const uid = req.user.uid;

  try {
    // Verificar se o bolão existe
    const groupBetRef = admin.database().ref(`group_bets/${groupBetId}`);
    const groupBetSnapshot = await groupBetRef.once('value');
    const groupBet = groupBetSnapshot.val();
    
    if (!groupBet) {
      return res.status(404).json({ error: 'Bolão não encontrado' });
    }
    
    // Verificar se o usuário já é membro
    if (groupBet.members.includes(uid)) {
      return res.status(400).json({ error: 'Você já é membro deste bolão' });
    }
    
    // Verificar se o bolão está cheio
    if (groupBet.members.length >= groupBet.max_members) {
      return res.status(400).json({ error: 'Bolão já está com o número máximo de membros' });
    }
    
    // Adicionar usuário ao bolão
    const updatedMembers = [...groupBet.members, uid];
    await groupBetRef.update({ members: updatedMembers });
    
    return res.status(200).json({
      message: 'Você entrou no bolão com sucesso',
      group_bet_id: groupBetId
    });
  } catch (error) {
    return res.status(500).json({ error: `Erro ao entrar no bolão: ${error.message}` });
  }
});

// Listar bolões do usuário
router.get('/user', authenticateToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const groupBetsSnapshot = await admin.database().ref('group_bets').once('value');
    
    const userGroupBets = [];
    groupBetsSnapshot.forEach(snapshot => {
      const groupBet = snapshot.val();
      if (groupBet.members.includes(uid)) {
        userGroupBets.push({
          id: snapshot.key,
          ...groupBet
        });
      }
    });

    return res.status(200).json(userGroupBets);
  } catch (error) {
    return res.status(500).json({ error: `Erro ao obter bolões: ${error.message}` });
  }
});

module.exports = router;