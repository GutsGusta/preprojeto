import { lerToken } from "../controllers/authController.js";
import { pool } from "../config/database.js";

export async function exigirCandidato(req, res, next) {
  try {
    const correspondencia = (req.headers.authorization || "").match(/^Bearer (.+)$/i);

    if (!correspondencia) {
      return res.status(401).json({ mensagem: "É necessário estar autenticado." });
    }

    const usuario = lerToken(correspondencia[1]);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }

    const [linhas] = await pool.query(
      `SELECT perfil, ativo, excluido_em
       FROM usuario
       WHERE id_usuario = ?`,
      [usuario.id]
    );

    const conta = linhas[0];

    if (!conta || !conta.ativo || conta.excluido_em !== null) {
      return res.status(401).json({ mensagem: "Conta bloqueada, excluída ou inexistente." });
    }

    if (conta.perfil !== "CANDIDATO" || !usuario.candidatoId) {
      return res.status(403).json({ mensagem: "Acesso permitido apenas para candidatos." });
    }

    req.usuario = usuario;
    next();
  } catch (erro) {
    next(erro);
  }
}
