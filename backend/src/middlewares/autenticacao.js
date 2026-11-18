import { lerToken } from "../controllers/authController.js";
import { pool } from "../config/database.js";

// Lê o token do cabeçalho e confere no banco se a conta continua valendo.
// Devolve { usuario } quando está tudo certo, ou { status, mensagem } com o motivo do bloqueio.
async function identificarUsuario(req) {
  const correspondencia = (req.headers.authorization || "").match(/^Bearer (.+)$/i);

  if (!correspondencia) {
    return { status: 401, mensagem: "É necessário estar autenticado." };
  }

  const usuario = lerToken(correspondencia[1]);

  if (!usuario) {
    return { status: 401, mensagem: "Token inválido ou expirado." };
  }

  const [linhas] = await pool.query(
    `SELECT perfil, ativo, excluido_em
     FROM usuario
     WHERE id_usuario = ?`,
    [usuario.id]
  );

  const conta = linhas[0];

  if (!conta || !conta.ativo || conta.excluido_em !== null) {
    return { status: 401, mensagem: "Conta bloqueada, excluída ou inexistente." };
  }

  if (conta.perfil !== usuario.perfil) {
    return { status: 401, mensagem: "As permissões da conta foram alteradas. Entre novamente." };
  }

  return { usuario };
}

// Rota que exige login, de qualquer perfil
export async function exigirLogin(req, res, next) {
  try {
    const { usuario, status, mensagem } = await identificarUsuario(req);

    if (!usuario) {
      return res.status(status).json({ mensagem });
    }

    req.usuario = usuario;
    next();
  } catch (erro) {
    next(erro);
  }
}

// Rota pública que mostra mais coisas para quem está logado (ex.: match e favoritos)
export async function identificarSeLogado(req, res, next) {
  try {
    req.usuario = null;

    if (req.headers.authorization) {
      const { usuario } = await identificarUsuario(req);
      req.usuario = usuario || null;
    }

    next();
  } catch (erro) {
    next(erro);
  }
}

export async function exigirCandidato(req, res, next) {
  try {
    const { usuario, status, mensagem } = await identificarUsuario(req);

    if (!usuario) {
      return res.status(status).json({ mensagem });
    }

    if (usuario.perfil !== "CANDIDATO" || !usuario.candidatoId) {
      return res.status(403).json({ mensagem: "Acesso permitido apenas para candidatos." });
    }

    req.usuario = usuario;
    next();
  } catch (erro) {
    next(erro);
  }
}

export async function exigirRecrutador(req, res, next) {
  try {
    const { usuario, status, mensagem } = await identificarUsuario(req);

    if (!usuario) {
      return res.status(status).json({ mensagem });
    }

    if (usuario.perfil !== "RECRUTADOR" || !usuario.empresaId) {
      return res.status(403).json({ mensagem: "Acesso permitido apenas para empresas." });
    }

    req.usuario = usuario;
    next();
  } catch (erro) {
    next(erro);
  }
}
