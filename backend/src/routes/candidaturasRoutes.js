const { Router } = require('express');
const { autenticar, exigirPerfil } = require('../middlewares/auth');
const candidaturasController = require('../controllers/candidaturasController');

// Criar e listar as candidaturas de uma vaga fica em /api/vagas/:id/candidaturas
const rotas = Router();
rotas.get('/motivos-reprovacao', candidaturasController.motivos);
rotas.get('/:id', autenticar, candidaturasController.detalhar);
rotas.patch('/:id/etapa', autenticar, exigirPerfil('RECRUTADOR'), candidaturasController.movimentar);
rotas.delete('/:id', autenticar, exigirPerfil('CANDIDATO'), candidaturasController.desistir);

module.exports = rotas;
