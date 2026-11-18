import { pool } from "../config/database.js";

// GET /api/favoritos/vagas — vagas favoritas do candidato (as que fecharam vêm com o status)
export async function listarVagasFavoritas(req, res, next) {
  try {
    const [vagas] = await pool.query(
      `SELECT v.id_vaga AS id, v.titulo, v.modalidade, v.tipo_contrato AS tipoContrato,
              v.cidade, v.uf, v.status, e.nome_fantasia AS empresa
       FROM favorito_vaga f
       JOIN vaga v ON v.id_vaga = f.vaga_id
       JOIN empresa e ON e.id_empresa = v.empresa_id
       WHERE f.usuario_id = ? AND v.status <> 'RASCUNHO'
       ORDER BY f.id_favorito_vaga DESC`,
      [req.usuario.id]
    );

    return res.json(vagas);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/favoritos  { tipo: "VAGA", referenciaId }
// Candidato favorita vagas; recrutador favorita candidatos. Favoritar não avisa ninguém.
export async function adicionarFavorito(req, res, next) {
  try {
    const tipo = String(req.body?.tipo || "").toUpperCase();
    const referenciaId = Number(req.body?.referenciaId);
    const { perfil, id: usuarioId } = req.usuario;

    if (!Number.isInteger(referenciaId) || referenciaId <= 0) {
      return res.status(400).json({ mensagem: "Informe o que deve ser favoritado." });
    }

    if (tipo === "VAGA" && perfil === "CANDIDATO") {
      const [vaga] = await pool.query("SELECT 1 FROM vaga WHERE id_vaga = ?", [referenciaId]);
      if (vaga.length === 0) return res.status(404).json({ mensagem: "Vaga não encontrada." });
      await pool.query("INSERT IGNORE INTO favorito_vaga (usuario_id, vaga_id) VALUES (?, ?)", [usuarioId, referenciaId]);
    } else if (tipo === "CANDIDATO" && perfil === "RECRUTADOR") {
      const [candidato] = await pool.query("SELECT 1 FROM candidato WHERE id_candidato = ?", [referenciaId]);
      if (candidato.length === 0) return res.status(404).json({ mensagem: "Candidato não encontrado." });
      await pool.query("INSERT IGNORE INTO favorito_candidato (usuario_id, candidato_id) VALUES (?, ?)", [usuarioId, referenciaId]);
    } else {
      return res.status(403).json({ mensagem: "Candidatos favoritam vagas e empresas favoritam candidatos." });
    }

    return res.status(201).json({ tipo, referenciaId, favorito: true });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/favoritos/:tipo/:referenciaId
export async function removerFavorito(req, res, next) {
  try {
    const tipo = String(req.params.tipo || "").toUpperCase();
    const referenciaId = Number(req.params.referenciaId);

    if (tipo === "VAGA") {
      await pool.query("DELETE FROM favorito_vaga WHERE usuario_id = ? AND vaga_id = ?", [req.usuario.id, referenciaId]);
    } else if (tipo === "CANDIDATO") {
      await pool.query("DELETE FROM favorito_candidato WHERE usuario_id = ? AND candidato_id = ?", [req.usuario.id, referenciaId]);
    } else {
      return res.status(400).json({ mensagem: "Tipo de favorito inválido." });
    }

    return res.json({ tipo, referenciaId, favorito: false });
  } catch (erro) {
    next(erro);
  }
}
