const { Router } = require('express');
const habilidadesController = require('../controllers/habilidadesController');

const rotas = Router();
rotas.get('/', habilidadesController.buscar);

module.exports = rotas;
