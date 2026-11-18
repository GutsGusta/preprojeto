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

// GET /api/home/numeros
// Totais da plataforma, usados na página "Para empresas".
export async function obterNumeros(req, res, next) {
  try {
    const [linhas] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM candidato c
          JOIN usuario u ON u.id_usuario = c.usuario_id
          WHERE u.excluido_em IS NULL) AS candidatos,
        (SELECT COUNT(*) FROM empresa) AS empresas,
        (SELECT COUNT(*) FROM vaga WHERE status = 'PUBLICADA') AS vagasAbertas,
        (SELECT COUNT(*) FROM candidatura) AS candidaturas
    `);

    return res.json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}
