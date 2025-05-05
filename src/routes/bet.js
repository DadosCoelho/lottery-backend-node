const express = require('express');
const admin = require('../config/firebase');
const requireAuth = require('../middleware/auth');
const Bet = require('../models/bet');
const router = express.Router();

router.post('/create', requireAuth, async (req, res) => {
  const { modality, initial_contest, final_contest, numbers, clovers = [] } = req.body;
  const userId = req.user.uid;

  if (!Bet.validate(modality, numbers, clovers)) {
    return res.status(400).json({ error: 'Dados de aposta inválidos' });
  }

  const bet = new Bet(userId, modality, initial_contest, final_contest, numbers, clovers);
  const betRef = admin.database().ref(`bets/${userId}`).push();
  await betRef.set(bet.toJSON());
  return res.status(201).json({ message: 'Aposta criada com sucesso', bet_id: betRef.key });
});

router.get('/list', requireAuth, async (req, res) => {
  const userId = req.user.uid;
  const bets = (await admin.database().ref(`bets/${userId}`).once('value')).val() || {};
  return res.status(200).json(bets);
});

module.exports = router;