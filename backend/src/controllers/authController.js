const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { ErroApi, invalido } = require('../middlewares/erros');

// POST /api/auth/login  { email, senha }
async function login(req, res) {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    const detalhes = {};
    if (!email) detalhes.email = 'Informe o e-mail.';
    if (!senha) detalhes.senha = 'Informe a senha.';
    throw invalido(detalhes);
  }

  const [u] = await query(
    `SELECT u.id, u.email, u.senha_hash, u.perfil, u.ativo,
            c.id AS candidato_id, c.nome AS nome_candidato,
            r.id AS recrutador_id, r.nome AS nome_recrutador, r.empresa_id,
            e.nome_fantasia AS empresa_nome
       FROM usuario u
       LEFT JOIN candidato  c ON c.usuario_id = u.id
       LEFT JOIN recrutador r ON r.usuario_id = u.id
       LEFT JOIN empresa    e ON e.id = r.empresa_id
      WHERE u.email = ?`, [String(email).trim()]);

  if (!u || !(await bcrypt.compare(String(senha), u.senha_hash))) {
    throw new ErroApi(401, 'credenciais_invalidas', 'E-mail ou senha incorretos.');
  }
  if (!u.ativo) throw new ErroApi(403, 'conta_bloqueada', 'Esta conta está bloqueada.');

  const usuario = {
    id: u.id,
    email: u.email,
    perfil: u.perfil,
    nome: u.nome_candidato || u.nome_recrutador || 'Administrador',
    candidatoId: u.candidato_id,
    recrutadorId: u.recrutador_id,
    empresaId: u.empresa_id,
    empresaNome: u.empresa_nome,
  };
  const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRA_EM || '8h' });
  res.json({ token, usuario });
}

// GET /api/auth/me — dados do usuário do token atual
function eu(req, res) {
  const { iat, exp, ...usuario } = req.usuario;
  res.json({ usuario });
}

module.exports = { login, eu };
