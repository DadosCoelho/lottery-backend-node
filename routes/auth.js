const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rotas protegidas
router.get('/check', authenticate, authController.checkAuth);

module.exports = router; 