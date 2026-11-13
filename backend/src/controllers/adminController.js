
import { pool } from "../config/database.js";

// INDICADORES DO DASHBOARD
export async function obterResumoAdmin(req, res, next) {
  try {
    const [candidatos] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM candidato c
       JOIN usuario u ON u.id_usuario = c.usuario_id
       WHERE u.excluido_em IS NULL`
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

// LISTAR USUÁRIOS
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
      WHERE u.excluido_em IS NULL
      ORDER BY u.id_usuario DESC
    `);

    return res.json(usuarios);
  } catch (erro) {
    next(erro);
  }
}

// LISTAR EMPRESAS
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

// RELATÓRIO DE CANDIDATURAS
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

// LISTAR VAGAS DE UMA EMPRESA
export async function listarVagasEmpresa(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "ID da empresa inválido."
      });
    }

    const [vagas] = await pool.query(
      `SELECT
        id_vaga AS id,
        titulo,
        status,
        modalidade,
        cidade,
        uf
      FROM vaga
      WHERE empresa_id = ?
      ORDER BY id_vaga DESC`,
      [id]
    );

    return res.json(vagas);
  } catch (erro) {
    next(erro);
  }
}

// BLOQUEAR OU DESBLOQUEAR USUÁRIO
export async function alterarSituacaoUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { ativo } = req.body || {};

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido."
      });
    }

    if (typeof ativo !== "boolean") {
      return res.status(400).json({
        mensagem: "O campo ativo deve ser true ou false."
      });
    }

    const [usuarios] = await pool.query(
      `SELECT perfil, excluido_em
       FROM usuario
       WHERE id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    if (usuarios[0].perfil === "ADMIN") {
      return res.status(403).json({
        mensagem: "Não é permitido alterar contas administrativas."
      });
    }

    if (usuarios[0].excluido_em !== null) {
      return res.status(409).json({
        mensagem: "Não é permitido alterar uma conta excluída."
      });
    }

    const [resultado] = await pool.query(
      `UPDATE usuario
       SET ativo = ?
       WHERE id_usuario = ?
         AND excluido_em IS NULL
         AND perfil <> 'ADMIN'`,
      [ativo ? 1 : 0, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(409).json({
        mensagem: "Não foi possível alterar a situação da conta."
      });
    }

    return res.json({
      mensagem: ativo
        ? "Usuário ativado com sucesso."
        : "Usuário bloqueado com sucesso."
    });
  } catch (erro) {
    next(erro);
  }
}

// EXCLUSÃO LÓGICA DE USUÁRIO
export async function excluirUsuario(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido."
      });
    }

    const [usuarios] = await pool.query(
      `SELECT perfil, excluido_em
       FROM usuario
       WHERE id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    if (usuarios[0].perfil === "ADMIN") {
      return res.status(403).json({
        mensagem: "Não é permitido excluir administradores."
      });
    }

    if (usuarios[0].excluido_em !== null) {
      return res.status(409).json({
        mensagem: "Esta conta já foi excluída."
      });
    }

    const [resultado] = await pool.query(
      `UPDATE usuario
       SET ativo = 0,
           excluido_em = NOW()
       WHERE id_usuario = ?
         AND excluido_em IS NULL
         AND perfil <> 'ADMIN'`,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(409).json({
        mensagem: "Não foi possível excluir esta conta."
      });
    }

    return res.json({
      mensagem: "Conta excluída com sucesso."
    });
  } catch (erro) {
    next(erro);
  }
}
