const { query } = require('../config/db');

// GET /api/habilidades?q=rea — sugestões para o campo de habilidades do formulário de vaga
async function buscar(req, res) {
  const termo = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const linhas = await query(
    `SELECT id, nome FROM habilidade WHERE ? = '' OR nome LIKE ? ORDER BY nome LIMIT 20`, [termo, `%${termo}%`]);
  res.json(linhas);
}

module.exports = { buscar };
