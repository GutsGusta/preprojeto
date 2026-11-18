import { pool } from "../config/database.js";

// GET /api/habilidades?q=rea — sugestões para os campos de habilidades
export async function buscarHabilidades(req, res, next) {
  try {
    const termo = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const [habilidades] = await pool.query(
      `SELECT id_habilidade AS id, nome
       FROM habilidade
       WHERE ? = '' OR nome LIKE ?
       ORDER BY nome
       LIMIT 20`,
      [termo, `%${termo}%`]
    );

    return res.json(habilidades);
  } catch (erro) {
    next(erro);
  }
}
