const express = require('express');
const admin = require('../config/firebase');
const Bet = require('../models/bet');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Criar nova aposta
router.post('/create', authenticateToken, async (req, res) => {
  const { modality, numbers, clovers, initial_contest, final_contest } = req.body;
  const uid = req.user.uid;

  try {
    // Verificar se o usuário existe
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    const user = userSnapshot.val();
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criar aposta
    const newBet = new Bet(
      null, // id será gerado pelo Firebase
      uid,
      modality,
      numbers,
      clovers || [],
      initial_contest,
      final_contest,
      new Date().toISOString()
    );

    const betRef = await admin.database().ref('bets').push(newBet.toJSON());
    
    return res.status(201).json({
      message: 'Aposta criada com sucesso',
      bet_id: betRef.key,
      bet: newBet.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ error: `Erro ao criar aposta: ${error.message}` });
  }
});

// Obter apostas do usuário
router.get('/user', authenticateToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const betsSnapshot = await admin.database()
      .ref('bets')
      .orderByChild('user_id')
      .equalTo(uid)
      .once('value');
    
    const bets = [];
    betsSnapshot.forEach(snapshot => {
      bets.push({
        id: snapshot.key,
        ...snapshot.val()
      });
    });

    return res.status(200).json(bets);
  } catch (error) {
    return res.status(500).json({ error: `Erro ao obter apostas: ${error.message}` });
  }
});

module.exports = router;