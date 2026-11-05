const { Router } = require('express');
const { autenticar, exigirPerfil } = require('../middlewares/auth');
const favoritosController = require('../controllers/favoritosController');

const rotas = Router();
rotas.use(autenticar);
rotas.get('/vagas', exigirPerfil('CANDIDATO'), favoritosController.vagasFavoritas);
rotas.post('/', favoritosController.adicionar);
rotas.delete('/:tipo/:referenciaId', favoritosController.remover);

module.exports = rotas;
