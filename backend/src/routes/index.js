const { Router } = require('express');
const healthController = require('../controllers/healthController');

// Junta todas as rotas da API. Tudo aqui fica embaixo de /api (veja app.js).
const rotas = Router();

rotas.get('/health', healthController.verificar);
rotas.use('/auth', require('./authRoutes'));
rotas.use('/vagas', require('./vagasRoutes'));
rotas.use('/candidaturas', require('./candidaturasRoutes'));
rotas.use('/favoritos', require('./favoritosRoutes'));
rotas.use('/habilidades', require('./habilidadesRoutes'));

module.exports = rotas;
