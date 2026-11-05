const { Router } = require('express');
const { autenticar } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const rotas = Router();
rotas.post('/login', authController.login);
rotas.get('/me', autenticar, authController.eu);

module.exports = rotas;
