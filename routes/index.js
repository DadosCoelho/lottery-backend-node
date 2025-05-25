const express = require('express');
const router = express.Router();
const axios = require('axios');

// Importar outras rotas
router.use('/auth', require('./auth'));
router.use('/bets', require('./bets'));
router.use('/items', require('./items'));
// router.use('/products', require('./products'));

// Rota para usuários (protegida)
const { authenticate } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.get('/users/profile', authenticate, authController.getUserProfile);

// Rota de proxy para a API de loterias
router.get('/loteria/:jogo/:concurso', async (req, res) => {
  try {
    const { jogo, concurso } = req.params;
    const url = `https://api.guidi.dev.br/loteria/${jogo}/${concurso}`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('Erro ao consultar API externa:', error?.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data,
        message: error.message
      });
    }
    return res.status(500).json({ error: 'Erro ao consultar API externa', details: error.message });
  }
});

// Rota de teste
router.get('/teste', (req, res) => {
  res.json({ message: 'Rota de teste funcionando!' });
});

module.exports = router;