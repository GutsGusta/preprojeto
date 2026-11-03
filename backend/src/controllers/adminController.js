
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
      "SELECT COUNT(*) AS total FROM vaga WHERE status = 'Publicada'"
    );

    const [denuncias] = await pool.query(
      "SELECT COUNT(*) AS total FROM denuncia_vaga WHERE status = 'PENDENTE'"
    );

    return res.json({
      candidatos: candidatos[0].total,
      empresas: empresas[0].total,
      vagasAbertas: vagas[0].total,
      denunciasPendentes: denuncias[0].total,
    });
  } catch (erro) {
    next(erro);
  }
}
