const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

// Rotas para itens
router.get('/', exampleController.getAll);
router.get('/:id', exampleController.getById);
router.post('/', exampleController.create);

module.exports = router; 