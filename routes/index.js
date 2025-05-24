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
    console.log(`Proxy para API de loterias: ${jogo}/${concurso}`);
    
    const url = `https://api.guidi.dev.br/loteria/${jogo}/${concurso}`;
    const response = await axios.get(url);
    
    // Retornar os dados obtidos da API externa
    return res.json(response.data);
  } catch (error) {
    console.error('Erro ao acessar API de loterias:', error.message);
    
    // Retornar erro em formato adequado
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Erro ao buscar dados da loteria',
      error: error.message
    });
  }
});

// Rota de teste
router.get('/teste', (req, res) => {
  res.json({ message: 'Rota de teste funcionando!' });
});

module.exports = router; 