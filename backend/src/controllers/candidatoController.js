import { pool } from "../config/database.js";

export async function obterResumoCandidato(req, res, next) {
  try {
    const { candidatoId, id: usuarioId } = req.usuario;

    const [linhas] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM candidatura
          WHERE candidato_id = ? AND status IN ('ENVIADA', 'EM_ANALISE', 'ENTREVISTA')) AS candidaturasAtivas,
        (SELECT COUNT(*) FROM candidatura
          WHERE candidato_id = ? AND status = 'ENTREVISTA') AS entrevistasMarcadas,
        (SELECT COUNT(*) FROM favorito_vaga WHERE usuario_id = ?) AS vagasFavoritas,
        (SELECT COALESCE(MAX(percentual_preenchido), 0) FROM curriculo
          WHERE candidato_id = ?) AS curriculoPreenchido`,
      [candidatoId, candidatoId, usuarioId, candidatoId]
    );

    return res.json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}

export async function listarVagasRecomendadas(req, res, next) {
  try {
    const [vagas] = await pool.query(
      `SELECT
        v.id_vaga AS id,
        v.titulo,
        v.cidade,
        v.uf,
        v.modalidade,
        v.tipo_contrato AS tipoContrato,
        e.nome_fantasia AS empresa
      FROM vaga v
      JOIN empresa e ON e.id_empresa = v.empresa_id
      JOIN candidato c ON c.id_candidato = ?
      WHERE v.status = 'PUBLICADA'
        AND NOT EXISTS (
          SELECT 1 FROM candidatura ca
          WHERE ca.vaga_id = v.id_vaga AND ca.candidato_id = c.id_candidato
        )
      ORDER BY (v.cidade = c.cidade) DESC, (v.uf = c.uf) DESC,
               v.publicada_em DESC, v.id_vaga DESC
      LIMIT 3`,
      [req.usuario.candidatoId]
    );

    return res.json(vagas);
  } catch (erro) {
    next(erro);
  }
}

export async function listarAtualizacoes(req, res, next) {
  try {
    const { candidatoId } = req.usuario;

    const [atualizacoes] = await pool.query(
      `SELECT vaga, status, etapa, ocorridaEm FROM (
        SELECT v.titulo AS vaga, ca.status AS status, NULL AS etapa, ca.criada_em AS ocorridaEm
        FROM candidatura ca
        JOIN vaga v ON v.id_vaga = ca.vaga_id
        WHERE ca.candidato_id = ?

        UNION ALL

        SELECT v.titulo, h.status, et.nome, h.data_alteracao
        FROM historico_candidatura h
        JOIN candidatura ca ON ca.id_candidatura = h.candidatura_id
        JOIN vaga v ON v.id_vaga = ca.vaga_id
        LEFT JOIN etapa_vaga et ON et.id_etapa = h.etapa_id
        WHERE ca.candidato_id = ?
      ) AS movimentacoes
      ORDER BY ocorridaEm DESC
      LIMIT 5`,
      [candidatoId, candidatoId]
    );

    return res.json(atualizacoes);
  } catch (erro) {
    next(erro);
  }
}
