import crypto from "node:crypto";
import { pool } from "../config/database.js";
import { salvarImagem, apagarImagem } from "../utils/imagens.js";

// Segredo usado para assinar o token de login. Defina JWT_SECRET no .env do backend.
const segredo = process.env.JWT_SECRET || "segredo-de-desenvolvimento";

// Transforma a senha digitada em um hash (scrypt, que já vem no Node).
// O resultado é salvo na coluna senha_hash no formato "sal:hash".
function gerarHashSenha(senha) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

// Confere se a senha digitada é a mesma que gerou o hash salvo no banco.
function conferirSenha(senha, senhaHash) {
  const [sal, hash] = senhaHash.split(":");
  if (!sal || !hash) return false;

  const hashDigitado = crypto.scryptSync(senha, sal, 64);
  const hashSalvo = Buffer.from(hash, "hex");

  return (
    hashDigitado.length === hashSalvo.length &&
    crypto.timingSafeEqual(hashDigitado, hashSalvo)
  );
}

// Remove tudo que não for número (usado em CPF, CNPJ e telefone).
function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

// Cria o token de login (formato JWT, assinado com o segredo) com validade de 8 horas.
// O frontend guarda esse token e o envia em todas as requisições.
function criarToken(usuario) {
  const cabecalho = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const validade = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const corpo = Buffer.from(JSON.stringify({ ...usuario, exp: validade })).toString("base64url");
  const assinatura = crypto
    .createHmac("sha256", segredo)
    .update(`${cabecalho}.${corpo}`)
    .digest("base64url");

  return `${cabecalho}.${corpo}.${assinatura}`;
}

// Confere se o token é verdadeiro (assinatura) e ainda está na validade.
// Devolve os dados do usuário guardados nele, ou null se o token não servir.
export function lerToken(token) {
  try {
    const partes = String(token || "").split(".");
    if (partes.length !== 3) return null;

    const [cabecalho, corpo, assinatura] = partes;

    const header = JSON.parse(
      Buffer.from(cabecalho, "base64url").toString("utf8")
    );

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const esperada = crypto
      .createHmac("sha256", segredo)
      .update(`${cabecalho}.${corpo}`)
      .digest();

    const recebida = Buffer.from(assinatura, "base64url");

    if (
      esperada.length !== recebida.length ||
      !crypto.timingSafeEqual(esperada, recebida)
    ) {
      return null;
    }

    const dados = JSON.parse(
      Buffer.from(corpo, "base64url").toString("utf8")
    );

    if (
      !dados ||
      typeof dados.id !== "number" ||
      typeof dados.exp !== "number" ||
      dados.exp <= Date.now() / 1000
    ) {
      return null;
    }

    return dados;
  } catch {
    return null;
  }
}

// POST /api/auth/cadastro
// Cria a conta de um candidato ou de uma empresa, conforme o campo "tipo".
export async function cadastrar(req, res, next) {
  const dados = req.body || {};
  const tipo = dados.tipo;
  const email = String(dados.email || "").trim().toLowerCase();
  const senha = String(dados.senha || "");
  const cidade = String(dados.cidade || "").trim();
  const uf = String(dados.uf || "").trim().toUpperCase();

  // Validações dos campos que são iguais para os dois tipos de conta
  if (tipo !== "candidato" && tipo !== "empresa") {
    return res.status(400).json({ mensagem: "Tipo de conta inválido." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ mensagem: "Informe um e-mail válido." });
  }
  if (senha.length < 8) {
    return res.status(400).json({ mensagem: "A senha precisa ter no mínimo 8 caracteres." });
  }
  if (!cidade || uf.length !== 2) {
    return res.status(400).json({ mensagem: "Informe a cidade e a UF (2 letras)." });
  }

  // Validações dos campos de cada tipo de conta
  const nome = String(dados.nome || "").trim();
  const cpf = somenteNumeros(dados.cpf);
  const telefone = somenteNumeros(dados.telefone);
  const razaoSocial = String(dados.razaoSocial || "").trim();
  const nomeFantasia = String(dados.nomeFantasia || "").trim();
  const cnpj = somenteNumeros(dados.cnpj);
  const setor = String(dados.setor || "").trim();
  const site = String(dados.site || "").trim();

  if (tipo === "candidato") {
    if (!nome || !dados.dataNascimento || !telefone) {
      return res.status(400).json({ mensagem: "Preencha todos os campos do candidato." });
    }
    if (cpf.length !== 11) {
      return res.status(400).json({ mensagem: "O CPF precisa ter 11 números." });
    }
  } else {
    if (!razaoSocial || !nomeFantasia || !setor) {
      return res.status(400).json({ mensagem: "Preencha todos os campos da empresa." });
    }
    if (cnpj.length !== 14) {
      return res.status(400).json({ mensagem: "O CNPJ precisa ter 14 números." });
    }
  }

  // Foto opcional: foto do candidato ou logo da empresa (salva em foto_url / logo_url)
  let fotoUrl = null;
  try {
    fotoUrl = salvarImagem(dados.foto, req);
  } catch (erro) {
    if (erro.status === 400) return res.status(400).json({ mensagem: erro.message });
    return next(erro);
  }

  // Usa uma conexão só para salvar tudo junto: se algo falhar, nada fica salvo pela metade
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const perfil = tipo === "candidato" ? "CANDIDATO" : "RECRUTADOR";
    const [usuario] = await conexao.query(
      "INSERT INTO usuario (email, senha_hash, perfil) VALUES (?, ?, ?)",
      [email, gerarHashSenha(senha), perfil]
    );

    if (tipo === "candidato") {
      await conexao.query(
        `INSERT INTO candidato (usuario_id, nome, cpf, data_nascimento, telefone, cidade, uf, foto_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuario.insertId, nome, cpf, dados.dataNascimento, telefone, cidade, uf, fotoUrl]
      );
    } else {
      const [empresa] = await conexao.query(
        `INSERT INTO empresa (razao_social, nome_fantasia, cnpj, setor, site, logo_url, cidade, uf)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [razaoSocial, nomeFantasia, cnpj, setor, site || null, fotoUrl, cidade, uf]
      );

      // A conta da empresa é o primeiro recrutador (administrador) dela
      await conexao.query(
        `INSERT INTO recrutador (usuario_id, empresa_id, nome, admin_empresa)
         VALUES (?, ?, ?, 1)`,
        [usuario.insertId, empresa.insertId, nomeFantasia]
      );
    }

    await conexao.commit();
    return res.status(201).json({ mensagem: "Conta criada com sucesso." });
  } catch (erro) {
    await conexao.rollback();
    apagarImagem(fotoUrl); // não deixa a foto sobrando se o cadastro não foi salvo

    // Erro do MySQL para valor repetido em coluna única (e-mail, CPF ou CNPJ)
    if (erro.code === "ER_DUP_ENTRY") {
      const campo = ["email", "cpf", "cnpj"].find((nomeCampo) =>
        erro.sqlMessage.includes(nomeCampo)
      );
      const nomes = { email: "e-mail", cpf: "CPF", cnpj: "CNPJ" };
      return res.status(409).json({
        mensagem: `Já existe uma conta com este ${nomes[campo] || "dado"}.`,
      });
    }

    next(erro);
  } finally {
    conexao.release();
  }
}

// POST /api/auth/login  { email, senha }
// Confere e-mail e senha e devolve o token de login junto com os dados do usuário.
export async function entrar(req, res, next) {
  try {
    const email = String((req.body || {}).email || "").trim().toLowerCase();
    const senha = String((req.body || {}).senha || "");

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "Informe o e-mail e a senha." });
    }

    // Busca o usuário e os dados dele (que ficam nas tabelas candidato, recrutador e empresa)
    const [linhas] = await pool.query(
      `SELECT u.id_usuario, u.email, u.senha_hash, u.perfil, u.ativo, u.excluido_em,
              c.id_candidato, c.nome AS nome_candidato, c.telefone, c.foto_url,
              r.id_recrutador, r.nome AS nome_recrutador, r.empresa_id,
              e.nome_fantasia AS empresa_nome,
              e.logo_url AS empresa_logo,
              e.razao_social,
              e.setor,
              e.site,
              e.descricao,
              e.cidade AS empresa_cidade,
              e.uf AS empresa_uf,
              e.cnpj,
              r.admin_empresa
         FROM usuario u
         LEFT JOIN candidato c ON c.usuario_id = u.id_usuario
         LEFT JOIN recrutador r ON r.usuario_id = u.id_usuario
         LEFT JOIN empresa e ON e.id_empresa = r.empresa_id
        WHERE u.email = ?`,
      [email]
    );
    const linha = linhas[0];

    // A mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails existem
    if (!linha || !conferirSenha(senha, linha.senha_hash)) {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }

    if (linha.excluido_em !== null) {
      return res.status(403).json({
        mensagem: "Esta conta foi excluída."
      });
    }

    if (!linha.ativo) {
      return res.status(403).json({
        mensagem: "Esta conta está bloqueada."
      });
    }

    const usuario = {
      id: linha.id_usuario,
      email: linha.email,
      perfil: linha.perfil,
      nome: linha.nome_candidato || linha.nome_recrutador || "Administrador",
      candidatoId: linha.id_candidato,
      telefone: linha.telefone,
      fotoUrl: linha.perfil === "RECRUTADOR"
        ? linha.empresa_logo
        : linha.foto_url,
      recrutadorId: linha.id_recrutador,
      empresaId: linha.empresa_id,
      empresaNome: linha.empresa_nome,
      razaoSocial: linha.razao_social,
      setor: linha.setor,
      site: linha.site,
      descricao: linha.descricao,
      cidade: linha.empresa_cidade,
      uf: linha.empresa_uf,
      cnpj: linha.cnpj,
      adminEmpresa: Boolean(linha.admin_empresa),
    };

    return res.json({ token: criarToken(usuario), usuario });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/auth/me
// Devolve o usuário do token enviado. O frontend usa isso ao abrir o site,
// para saber se a pessoa continua logada.

export async function eu(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const correspondencia = authorization.match(/^Bearer (.+)$/i);

    if (!correspondencia) {
      return res.status(401).json({
        mensagem: "Sessão inválida ou expirada."
      });
    }

    const dados = lerToken(correspondencia[1]);

    if (!dados) {
      return res.status(401).json({
        mensagem: "Sessão inválida ou expirada."
      });
    }

    const [linhas] = await pool.query(
      `SELECT id_usuario, email, perfil, ativo, excluido_em
       FROM usuario
       WHERE id_usuario = ?`,
      [dados.id]
    );

    const conta = linhas[0];

    if (!conta || !conta.ativo || conta.excluido_em !== null) {
      return res.status(401).json({
        mensagem: "Esta conta não está mais autorizada."
      });
    }

    // Impede que um token antigo mantenha permissões alteradas
    if (conta.perfil !== dados.perfil) {
      return res.status(401).json({
        mensagem: "As permissões da conta foram alteradas. Entre novamente."
      });
    }


    const { exp, ...usuario } = dados;

    if (usuario.perfil === "CANDIDATO") {
      const [candidatos] = await pool.query(
        `SELECT id_candidato, nome, telefone, foto_url
     FROM candidato
     WHERE usuario_id = ?`,
        [usuario.id]
      );

      if (candidatos.length === 0) {
        return res.status(404).json({
          mensagem: "Perfil de candidato não encontrado."
        });
      }

      usuario.nome = candidatos[0].nome;
      usuario.telefone = candidatos[0].telefone;
      usuario.candidatoId = candidatos[0].id_candidato;
      usuario.fotoUrl = candidatos[0].foto_url;
    }

    if (usuario.perfil === "RECRUTADOR") {
  const [empresas] = await pool.query(
    `SELECT
        r.id_recrutador,
        r.nome,
        r.admin_empresa,
        e.id_empresa,
        e.nome_fantasia,
        e.razao_social,
        e.cnpj,
        e.setor,
        e.site,
        e.descricao,
        e.cidade,
        e.uf,
        e.logo_url
     FROM recrutador r
     INNER JOIN empresa e
        ON e.id_empresa = r.empresa_id
     WHERE r.usuario_id = ?
       AND e.ativo = 1
       AND e.excluido_em IS NULL`,
    [usuario.id]
  );

  if (empresas.length === 0) {
    return res.status(404).json({
      mensagem: "Perfil de empresa não encontrado."
    });
  }

  const empresa = empresas[0];

  usuario.nome = empresa.nome;
  usuario.recrutadorId = empresa.id_recrutador;
  usuario.empresaId = empresa.id_empresa;
  usuario.empresaNome = empresa.nome_fantasia;
  usuario.razaoSocial = empresa.razao_social;
  usuario.cnpj = empresa.cnpj;
  usuario.setor = empresa.setor;
  usuario.site = empresa.site;
  usuario.descricao = empresa.descricao;
  usuario.cidade = empresa.cidade;
  usuario.uf = empresa.uf;
  usuario.fotoUrl = empresa.logo_url;
  usuario.adminEmpresa = Boolean(empresa.admin_empresa);
}

    return res.json({ usuario });


  } catch (erro) {
    next(erro);
  }
}



// PUT /api/auth/perfil
export async function atualizarPerfil(req, res, next) {
  let novaFotoUrl = null;

  try {
    const usuarioId = req.usuario.id;
    if (req.body?.removerFoto === true) {
    if (req.usuario.perfil === "CANDIDATO") {
        const [resultado] = await pool.query(
            "UPDATE candidato SET foto_url = NULL WHERE usuario_id = ?",
            [usuarioId]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: "Candidato não encontrado."
            });
        }

    } else if (req.usuario.perfil === "RECRUTADOR") {
        const [resultado] = await pool.query(
            `UPDATE empresa e
             INNER JOIN recrutador r
                ON r.empresa_id = e.id_empresa
             SET e.logo_url = NULL
             WHERE r.usuario_id = ?
                AND r.admin_empresa = 1
                AND e.ativo = 1
                AND e.excluido_em IS NULL`,
            [usuarioId]
        );

        if (!resultado.affectedRows) {
            return res.status(403).json({
                mensagem: "Sem permissão para remover o logotipo."
            });
        }

    } else {
        return res.status(403).json({
            mensagem: "Operação não permitida."
        });
    }

    return res.json({
        mensagem: "Imagem removida com sucesso.",
        fotoUrl: null
    });
}

    if (req.usuario.perfil === "RECRUTADOR") {
  const nomeFantasia = String(req.body?.nomeFantasia || "").trim();
  const razaoSocial = String(req.body?.razaoSocial || "").trim();
  const setor = String(req.body?.setor || "").trim();
  const site = String(req.body?.site || "").trim();
  const descricao = String(req.body?.descricao || "").trim();
  const cidade = String(req.body?.cidade || "").trim();
  const uf = String(req.body?.uf || "").trim().toUpperCase();
  const UFS_VALIDAS = new Set(
    "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")
);

  if (!nomeFantasia || !razaoSocial || !setor || !cidade) {
    return res.status(400).json({
      mensagem: "Preencha todos os campos obrigatórios."
    });
  }

  if (!UFS_VALIDAS.has(uf)) {
    return res.status(400).json({
      mensagem: "Informe uma UF válida."
    });
  }

  if (req.body?.foto) {
    novaFotoUrl = salvarImagem(req.body.foto, req);
  }

  const [resultado] = await pool.query(
    `UPDATE empresa e
     INNER JOIN recrutador r
       ON r.empresa_id = e.id_empresa
     SET e.nome_fantasia = ?,
         e.razao_social = ?,
         e.setor = ?,
         e.site = ?,
         e.descricao = ?,
         e.cidade = ?,
         e.uf = ?,
         e.logo_url = COALESCE(?, e.logo_url)
     WHERE r.usuario_id = ?
       AND r.admin_empresa = 1
       AND e.ativo = 1
       AND e.excluido_em IS NULL`,
    [
      nomeFantasia,
      razaoSocial,
      setor,
      site || null,
      descricao || null,
      cidade,
      uf,
      novaFotoUrl,
      usuarioId
    ]
  );

  if (resultado.affectedRows === 0) {
    apagarImagem(novaFotoUrl);

    return res.status(403).json({
      mensagem: "Não foi possível atualizar os dados da empresa."
    });
  }

  return res.json({
    mensagem: "Informações atualizadas com sucesso.",
    empresaNome: nomeFantasia,
    razaoSocial,
    setor,
    site,
    descricao,
    cidade,
    uf,
    ...(novaFotoUrl ? { fotoUrl: novaFotoUrl } : {})
  });
}

    if (req.usuario.perfil !== "CANDIDATO") {
      return res.status(403).json({
        mensagem: "Esta funcionalidade está disponível apenas para candidatos."
      });
    }

    const nome = String(req.body?.nome || "").trim();
    const telefone = somenteNumeros(req.body?.telefone);

    if (nome.length < 2 || nome.length > 150) {
      return res.status(400).json({
        mensagem: "O nome deve ter entre 2 e 150 caracteres."
      });
    }

    if (telefone.length < 10 || telefone.length > 11) {
      return res.status(400).json({
        mensagem: "Informe um telefone válido com DDD."
      });
    }

    if (req.body?.foto) {
      novaFotoUrl = salvarImagem(req.body.foto, req);
    }

    const [resultado] = await pool.query(
      `UPDATE candidato
       SET nome = ?, telefone = ?,
           foto_url = COALESCE(?, foto_url)
       WHERE usuario_id = ?`,
      [nome, telefone, novaFotoUrl, usuarioId]
    );

    if (resultado.affectedRows === 0) {
      apagarImagem(novaFotoUrl);

      return res.status(404).json({
        mensagem: "Perfil de candidato não encontrado."
      });
    }

    return res.json({
      mensagem: "Informações atualizadas com sucesso.",
      nome,
      telefone,
      ...(novaFotoUrl ? { fotoUrl: novaFotoUrl } : {})
    });

  } catch (erro) {
    apagarImagem(novaFotoUrl);

    if (erro.status === 400) {
      return res.status(400).json({
        mensagem: erro.message
      });
    }

    next(erro);
  }
}


// PUT /api/auth/senha
export async function alterarSenha(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    const senhaAtual = String(req.body?.senhaAtual || "");
    const novaSenha = String(req.body?.novaSenha || "");

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        mensagem: "Preencha a senha atual e a nova senha."
      });
    }

    if (novaSenha.length < 8 || novaSenha.length > 128) {
      return res.status(400).json({
        mensagem: "A nova senha deve ter entre 8 e 128 caracteres."
      });
    }

    const [linhas] = await pool.query(
      `SELECT senha_hash
       FROM usuario
       WHERE id_usuario = ? AND ativo = 1 AND excluido_em IS NULL`,
      [usuarioId]
    );

    if (linhas.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    const senhaCorreta = conferirSenha(
      senhaAtual,
      linhas[0].senha_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "SENHA_ATUAL_INCORRETA",
        mensagem: "A senha atual está incorreta."
      });
    }

    if (senhaAtual === novaSenha) {
      return res.status(400).json({
        mensagem: "A nova senha deve ser diferente da atual."
      });
    }

    const novoHash = gerarHashSenha(novaSenha);

    await pool.query(
      `UPDATE usuario
       SET senha_hash = ?
       WHERE id_usuario = ?`,
      [novoHash, usuarioId]
    );

    return res.json({
      mensagem: "Senha alterada com sucesso."
    });
  } catch (erro) {
    next(erro);
  }
}

