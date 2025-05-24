const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const { authenticate } = require('../middlewares/authMiddleware');

// Todas as rotas de apostas exigem autenticação
router.use(authenticate);

// Criar uma nova aposta
router.post('/', betController.createBet);

// Criar uma nova aposta em grupo
router.post('/group', betController.createGroupBet);

// Obter todas as apostas do usuário
router.get('/', betController.getUserBets);

// Obter detalhes de uma aposta específica
router.get('/:id', betController.getBetDetails);

// Verifica e salva o resultado de uma aposta específica
router.get('/check-and-save-result/:id', betController.checkAndSaveBetResult);

module.exports = router; 