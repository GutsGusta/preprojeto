import crypto from "node:crypto";
import { pool } from "../config/database.js";

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
function lerToken(token) {
  const [cabecalho, corpo, assinatura] = String(token || "").split(".");
  if (!cabecalho || !corpo || !assinatura) return null;

  const esperada = crypto
    .createHmac("sha256", segredo)
    .update(`${cabecalho}.${corpo}`)
    .digest();
  const recebida = Buffer.from(assinatura, "base64url");

  if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) {
    return null;
  }

  const dados = JSON.parse(Buffer.from(corpo, "base64url").toString());
  return dados.exp > Date.now() / 1000 ? dados : null;
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
        `INSERT INTO candidato (usuario_id, nome, cpf, data_nascimento, telefone, cidade, uf)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [usuario.insertId, nome, cpf, dados.dataNascimento, telefone, cidade, uf]
      );
    } else {
      const [empresa] = await conexao.query(
        `INSERT INTO empresa (razao_social, nome_fantasia, cnpj, setor, site, cidade, uf)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [razaoSocial, nomeFantasia, cnpj, setor, site || null, cidade, uf]
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
      `SELECT u.id_usuario, u.email, u.senha_hash, u.perfil, u.ativo,
              c.id_candidato, c.nome AS nome_candidato,
              r.id_recrutador, r.nome AS nome_recrutador, r.empresa_id,
              e.nome_fantasia AS empresa_nome
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

    if (!linha.ativo) {
      return res.status(403).json({ mensagem: "Esta conta está bloqueada." });
    }

    const usuario = {
      id: linha.id_usuario,
      email: linha.email,
      perfil: linha.perfil,
      nome: linha.nome_candidato || linha.nome_recrutador || "Administrador",
      candidatoId: linha.id_candidato,
      recrutadorId: linha.id_recrutador,
      empresaId: linha.empresa_id,
      empresaNome: linha.empresa_nome,
    };

    return res.json({ token: criarToken(usuario), usuario });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/auth/me
// Devolve o usuário do token enviado. O frontend usa isso ao abrir o site,
// para saber se a pessoa continua logada.
export function eu(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const dados = lerToken(token);

  if (!dados) {
    return res.status(401).json({ mensagem: "Sessão inválida ou expirada." });
  }

  const { exp, ...usuario } = dados;
  return res.json({ usuario });
}
