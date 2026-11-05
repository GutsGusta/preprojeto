const { query } = require('../config/db');
const { invalido, naoEncontrado, proibido, lerId } = require('../middlewares/erros');

// Candidato favorita VAGAS e recrutador favorita CANDIDATOS (RF13). Favoritar não notifica ninguém (RN17).
function conferirTipo(tipo, usuario) {
  tipo = String(tipo || '').toUpperCase();
  if (!['VAGA', 'CANDIDATO'].includes(tipo)) throw invalido({ tipo: 'Use VAGA ou CANDIDATO.' });
  if (tipo === 'VAGA' && usuario.perfil !== 'CANDIDATO') throw proibido('Só candidatos favoritam vagas.');
  if (tipo === 'CANDIDATO' && usuario.perfil !== 'RECRUTADOR') throw proibido('Só recrutadores favoritam candidatos.');
  return tipo;
}

// POST /api/favoritos  { tipo: 'VAGA', referenciaId: 12 }
async function adicionar(req, res) {
  const tipo = conferirTipo(req.body?.tipo, req.usuario);
  const referenciaId = lerId(req.body?.referenciaId);
  const tabela = tipo === 'VAGA' ? 'vaga' : 'candidato';
  if (!(await query(`SELECT 1 FROM ${tabela} WHERE id = ?`, [referenciaId])).length) {
    throw naoEncontrado(tipo === 'VAGA' ? 'Vaga não encontrada.' : 'Candidato não encontrado.');
  }
  await query('INSERT IGNORE INTO favorito (usuario_id, tipo, referencia_id) VALUES (?, ?, ?)', [req.usuario.id, tipo, referenciaId]);
  res.status(201).json({ tipo, referenciaId, favorito: true });
}

// DELETE /api/favoritos/:tipo/:referenciaId
async function remover(req, res) {
  const tipo = conferirTipo(req.params.tipo, req.usuario);
  const referenciaId = lerId(req.params.referenciaId);
  await query('DELETE FROM favorito WHERE usuario_id = ? AND tipo = ? AND referencia_id = ?', [req.usuario.id, tipo, referenciaId]);
  res.json({ tipo, referenciaId, favorito: false });
}

// GET /api/favoritos/vagas — vagas favoritas do candidato (as que já fecharam vêm com o status)
async function vagasFavoritas(req, res) {
  const linhas = await query(
    `SELECT v.id, v.titulo, v.modalidade, v.tipo_contrato, v.cidade, v.uf, v.status,
            e.nome_fantasia AS empresa, f.criado_em AS salva_em
       FROM favorito f
       JOIN vaga v ON v.id = f.referencia_id
       JOIN empresa e ON e.id = v.empresa_id
      WHERE f.usuario_id = ? AND f.tipo = 'VAGA' AND v.status <> 'RASCUNHO'
      ORDER BY f.criado_em DESC`, [req.usuario.id]);
  res.json(linhas.map((l) => ({
    id: l.id, titulo: l.titulo, modalidade: l.modalidade, tipoContrato: l.tipo_contrato,
    cidade: l.cidade, uf: l.uf, status: l.status, empresa: l.empresa, salvaEm: l.salva_em,
  })));
}

module.exports = { adicionar, remover, vagasFavoritas };
