const { Router } = require('express');
const { autenticar, autenticarOpcional, exigirPerfil } = require('../middlewares/auth');
const vagasController = require('../controllers/vagasController');
const candidaturasController = require('../controllers/candidaturasController');

const rotas = Router();
const recrutador = [autenticar, exigirPerfil('RECRUTADOR')];
const candidato = [autenticar, exigirPerfil('CANDIDATO')];

// Públicas (com login de candidato aparecem o match e os favoritos)
rotas.get('/', autenticarOpcional, vagasController.listar);
rotas.get('/filtros', vagasController.filtros);

// Empresa ("/minhas" vem antes de "/:id" para não ser lido como um id)
rotas.get('/minhas', ...recrutador, vagasController.minhas);
rotas.post('/', ...recrutador, vagasController.criar);

rotas.get('/:id', autenticarOpcional, vagasController.detalhar);
rotas.put('/:id', ...recrutador, vagasController.atualizar);
rotas.patch('/:id/status', ...recrutador, vagasController.alterarStatus);
rotas.post('/:id/duplicar', ...recrutador, vagasController.duplicar);
rotas.delete('/:id', ...recrutador, vagasController.excluir);

// Processo seletivo da vaga
rotas.get('/:id/candidaturas', ...recrutador, candidaturasController.listarPorVaga);
rotas.post('/:id/candidaturas', ...candidato, candidaturasController.candidatar);

module.exports = rotas;
