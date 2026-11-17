import { pool } from "../config/database.js";

// GET /api/home/vagas-recentes
// Devolve as 3 vagas publicadas mais recentes, para a seção "Vagas recentes" da homepage.
export async function listarVagasRecentes(req, res, next) {
  try {
    const [vagas] = await pool.query(`
      SELECT
        v.id_vaga AS id,
        v.titulo,
        v.descricao,
        v.cidade,
        v.uf,
        v.modalidade,
        v.tipo_contrato AS tipoContrato,
        e.nome_fantasia AS empresa,
        e.logo_url AS logoUrl
      FROM vaga v
      JOIN empresa e ON e.id_empresa = v.empresa_id
      WHERE v.status = 'PUBLICADA'
      ORDER BY v.publicada_em DESC, v.id_vaga DESC
      LIMIT 3
    `);

    return res.json(vagas);
  } catch (erro) {
    next(erro);
  }
}
