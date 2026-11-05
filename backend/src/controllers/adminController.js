
import { pool } from "../config/database.js";

export async function obterResumoAdmin(req, res, next) {
  try {
    const [candidatos] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidato"
    );

    const [empresas] = await pool.query(
      "SELECT COUNT(*) AS total FROM empresa"
    );

    const [vagas] = await pool.query(
      "SELECT COUNT(*) AS total FROM vaga WHERE status = 'PUBLICADA'"
    );

    const [candidaturas] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidatura"
    );

    return res.json({
      candidatos: candidatos[0].total,
      empresas: empresas[0].total,
      vagasAbertas: vagas[0].total,
      totalCandidaturas: candidaturas[0].total
    });

  } catch (erro) {
    next(erro);
  }
}


export async function listarUsuarios(req, res, next) {
  try {
    const [usuarios] = await pool.query(`
          SELECT
              u.id_usuario AS id,
              COALESCE(c.nome, r.nome, 'Administrador') AS nome,
              u.email,
              u.perfil,
              u.ativo
          FROM usuario u
          LEFT JOIN candidato c
              ON c.usuario_id = u.id_usuario
          LEFT JOIN recrutador r
              ON r.usuario_id = u.id_usuario
          ORDER BY u.id_usuario DESC
      `);

    res.json(usuarios);
  } catch (erro) {
    next(erro);
  }
}

export async function listarEmpresas(req, res, next) {
  try {
    const [empresas] = await pool.query(`
      SELECT
        id_empresa AS id,
        nome_fantasia AS nome,
        razao_social,
        cnpj,
        setor,
        cidade,
        uf
      FROM empresa
      ORDER BY id_empresa DESC
    `);

    return res.json(empresas);
  } catch (erro) {
    next(erro);
  }
}

export async function relatorioCandidaturas(req, res, next) {
  try {
      const [resultado] = await pool.query(`
          SELECT
              status,
              COUNT(*) AS quantidade
          FROM candidatura
          GROUP BY status
          ORDER BY quantidade DESC
      `);

      return res.json(resultado);
  } catch (erro) {
      next(erro);
  }
}
