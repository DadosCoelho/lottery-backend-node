const express = require('express');
const admin = require('../config/firebase');
const requireAuth = require('../middleware/auth');
const Bet = require('../models/bet');
const GroupBet = require('../models/groupBet');
const router = express.Router();

const checkPremium = async (uid) => {
  const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
  return userData && userData.is_premium;
};

router.post('/create', requireAuth, async (req, res) => {
  const { modality, initial_contest, final_contest, numbers, clovers = [] } = req.body;
  const creatorId = req.user.uid;

  if (!await checkPremium(creatorId)) {
    return res.status(403).json({ error: 'Apenas usuários premium podem criar bolões' });
  }

  if (!Bet.validate(modality, numbers, clovers)) {
    return res.status(400).json({ error: 'Dados do bolão inválidos' });
  }

  const groupBet = new GroupBet(creatorId, modality, initial_contest, final_contest, numbers, clovers);
  const groupBetRef = admin.database().ref('group_bets').push();
  await groupBetRef.set(groupBet.toJSON());
  return res.status(201).json({ message: 'Bolão criado com sucesso', group_bet_id: groupBetRef.key });
});

router.post('/join/:group_bet_id', requireAuth, async (req, res) => {
  const groupBetId = req.params.group_bet_id;
  const userId = req.user.uid;

  const groupBetRef = admin.database().ref(`group_bets/${groupBetId}`);
  const groupBet = (await groupBetRef.once('value')).val();
  if (!groupBet) {
    return res.status(404).json({ error: 'Bolão não encontrado' });
  }

  await groupBetRef.child(`participants/${userId}`).set(true);
  return res.status(200).json({ message: 'Ingressou no bolão com sucesso' });
});

module.exports = router;