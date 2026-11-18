import { pool } from "../config/database.js";

const MODALIDADES = ["PRESENCIAL", "HIBRIDO", "REMOTO"];
const CONTRATOS = ["CLT", "PJ", "ESTAGIO", "TEMPORARIO", "FREELANCER"];

// Mudanças de status permitidas: Rascunho → Publicada → Pausada ↔ Publicada → Encerrada
const TRANSICOES = {
  RASCUNHO: ["PUBLICADA"],
  PUBLICADA: ["PAUSADA", "ENCERRADA"],
  PAUSADA: ["PUBLICADA", "ENCERRADA"],
  ENCERRADA: [],
};

// ---------------------------------------------------------------------
// Funções de apoio (também usadas pelo candidaturasController)
// ---------------------------------------------------------------------

const numeroOuNulo = (valor) => (valor === null || valor === undefined ? null : Number(valor));

function semAcento(texto) {
  return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

// Compatibilidade entre o candidato e a vaga, de 0 a 100 (recurso avançado da documentação).
// 50% habilidades, 15% localização e 15% salário, reescalados para somar 100%.
export function calcularMatch(perfil, vaga) {
  if (!perfil) return null;

  const exigidas = vaga.habilidades || [];
  const habilidades = exigidas.length === 0
    ? 1
    : exigidas.filter((nome) => perfil.habilidades.has(nome)).length / exigidas.length;

  let localizacao = 0;
  if (vaga.modalidade === "REMOTO") localizacao = 1;
  else if (vaga.cidade && semAcento(vaga.cidade) === semAcento(perfil.cidade)) localizacao = 1;
  else if (vaga.uf && vaga.uf === perfil.uf) localizacao = 0.5;

  let salario = 1;
  const maximo = numeroOuNulo(vaga.salario_max);
  const pretensao = numeroOuNulo(perfil.pretensao);
  if (pretensao !== null && maximo && pretensao > maximo) {
    salario = Math.max(0, 1 - (pretensao - maximo) / maximo);
  }

  return Math.round(((0.5 * habilidades + 0.15 * localizacao + 0.15 * salario) / 0.8) * 100);
}

// Cidade, UF, pretensão e habilidades de cada candidato, para o cálculo do match
export async function carregarPerfis(candidatoIds) {
  const perfis = new Map();
  if (candidatoIds.length === 0) return perfis;

  const [candidatos] = await pool.query(
    `SELECT c.id_candidato, c.cidade, c.uf, cu.pretensao_salarial
     FROM candidato c
     LEFT JOIN curriculo cu ON cu.candidato_id = c.id_candidato
     WHERE c.id_candidato IN (?)`,
    [candidatoIds]
  );

  for (const c of candidatos) {
    perfis.set(c.id_candidato, {
      cidade: c.cidade,
      uf: c.uf,
      pretensao: c.pretensao_salarial,
      habilidades: new Set(),
    });
  }

  const [habilidades] = await pool.query(
    `SELECT cu.candidato_id, h.nome
     FROM curriculo cu
     JOIN curriculo_habilidade ch ON ch.curriculo_id = cu.id_curriculo
     JOIN habilidade h ON h.id_habilidade = ch.habilidade_id
     WHERE cu.candidato_id IN (?)`,
    [candidatoIds]
  );

  for (const h of habilidades) {
    perfis.get(h.candidato_id)?.habilidades.add(h.nome);
  }

  return perfis;
}

// Coloca em cada vaga a lista com o nome das habilidades
export async function anexarHabilidades(vagas) {
  if (vagas.length === 0) return vagas;

  const [linhas] = await pool.query(
    `SELECT vh.vaga_id, h.nome
     FROM vaga_habilidade vh
     JOIN habilidade h ON h.id_habilidade = vh.habilidade_id
     WHERE vh.vaga_id IN (?)
     ORDER BY h.nome`,
    [vagas.map((v) => v.id_vaga)]
  );

  for (const vaga of vagas) {
    vaga.habilidades = linhas.filter((l) => l.vaga_id === vaga.id_vaga).map((l) => l.nome);
  }

  return vagas;
}

// Formato da vaga nas respostas (camelCase, como o frontend usa)
export function formatarVaga(v) {
  return {
    id: v.id_vaga,
    titulo: v.titulo,
    area: v.area,
    nivel: v.nivel,
    modalidade: v.modalidade,
    tipoContrato: v.tipo_contrato,
    cidade: v.cidade,
    uf: v.uf,
    salarioMin: numeroOuNulo(v.salario_min),
    salarioMax: numeroOuNulo(v.salario_max),
    status: v.status,
    publicadaEm: v.publicada_em,
    habilidades: v.habilidades || [],
    empresa: { id: v.empresa_id, nome: v.empresa_nome, logoUrl: v.empresa_logo },
  };
}

// Confere se a vaga existe e é da empresa do recrutador. Devolve a vaga ou uma resposta de erro.
async function buscarVagaDaEmpresa(conexao, vagaId, usuario) {
  const [linhas] = await conexao.query("SELECT * FROM vaga WHERE id_vaga = ? FOR UPDATE", [vagaId]);
  const vaga = linhas[0];

  if (!vaga) return { status: 404, mensagem: "Vaga não encontrada." };
  if (vaga.empresa_id !== usuario.empresaId) {
    return { status: 403, mensagem: "Só a empresa dona da vaga pode fazer isso." };
  }
  return { vaga };
}

// Lê e valida o formulário da vaga. Devolve { dados } ou { detalhes } com o erro de cada campo.
function validarVaga(corpo = {}) {
  const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");
  const numero = (valor) => (valor === "" || valor === null || valor === undefined ? null : Number(valor));

  const dados = {
    titulo: texto(corpo.titulo),
    descricao: texto(corpo.descricao),
    area: texto(corpo.area),
    nivel: texto(corpo.nivel),
    modalidade: texto(corpo.modalidade).toUpperCase(),
    tipoContrato: texto(corpo.tipoContrato).toUpperCase(),
    cidade: texto(corpo.cidade) || null,
    uf: texto(corpo.uf).toUpperCase() || null,
    salarioMin: numero(corpo.salarioMin),
    salarioMax: numero(corpo.salarioMax),
    etapas: Array.isArray(corpo.etapas) ? corpo.etapas.map(texto).filter(Boolean) : [],
    habilidades: Array.isArray(corpo.habilidades) ? [...new Set(corpo.habilidades.map(texto).filter(Boolean))] : [],
  };

  const detalhes = {};
  if (dados.titulo.length < 3 || dados.titulo.length > 150) detalhes.titulo = "O título deve ter entre 3 e 150 caracteres.";
  if (!dados.descricao) detalhes.descricao = "Descreva a vaga.";
  if (!dados.area) detalhes.area = "Informe a área.";
  if (!dados.nivel) detalhes.nivel = "Informe o nível.";
  if (!MODALIDADES.includes(dados.modalidade)) detalhes.modalidade = "Escolha presencial, híbrido ou remoto.";
  if (!CONTRATOS.includes(dados.tipoContrato)) detalhes.tipoContrato = "Escolha um tipo de contrato válido.";
  if (dados.modalidade !== "REMOTO" && !dados.cidade) detalhes.cidade = "Informe a cidade (obrigatória para vagas não remotas).";
  if (dados.uf && !/^[A-Z]{2}$/.test(dados.uf)) detalhes.uf = "Use a sigla do estado, ex.: SP.";
  for (const campo of ["salarioMin", "salarioMax"]) {
    if (dados[campo] !== null && (!Number.isFinite(dados[campo]) || dados[campo] < 0)) detalhes[campo] = "Informe um valor positivo.";
  }
  if (dados.salarioMin !== null && dados.salarioMax !== null && dados.salarioMin > dados.salarioMax) {
    detalhes.salarioMax = "O salário máximo não pode ser menor que o mínimo.";
  }
  if (dados.etapas.length === 0) detalhes.etapas = "A vaga precisa de pelo menos uma etapa de seleção.";
  if (dados.etapas.length > 10) detalhes.etapas = "Use no máximo 10 etapas.";
  if (dados.habilidades.length > 20) detalhes.habilidades = "Use no máximo 20 habilidades.";

  return Object.keys(detalhes).length > 0 ? { detalhes } : { dados };
}

async function salvarEtapas(conexao, vagaId, etapas) {
  await conexao.query("DELETE FROM etapa_vaga WHERE vaga_id = ?", [vagaId]);
  for (const [i, nome] of etapas.entries()) {
    await conexao.query("INSERT INTO etapa_vaga (vaga_id, nome, ordem) VALUES (?, ?, ?)", [vagaId, nome, i + 1]);
  }
}

// Cadastra as habilidades novas e liga todas à vaga
async function salvarHabilidades(conexao, vagaId, nomes) {
  await conexao.query("DELETE FROM vaga_habilidade WHERE vaga_id = ?", [vagaId]);
  for (const nome of nomes) {
    const [existente] = await conexao.query("SELECT id_habilidade FROM habilidade WHERE nome = ?", [nome]);
    let habilidadeId = existente[0]?.id_habilidade;
    if (!habilidadeId) {
      const [nova] = await conexao.query("INSERT INTO habilidade (nome) VALUES (?)", [nome]);
      habilidadeId = nova.insertId;
    }
    await conexao.query("INSERT IGNORE INTO vaga_habilidade (vaga_id, habilidade_id) VALUES (?, ?)", [vagaId, habilidadeId]);
  }
}

// Transforma "?modalidade=REMOTO,HIBRIDO" em ["REMOTO", "HIBRIDO"], ignorando valores inválidos
function lerLista(valor, permitidos) {
  if (!valor) return [];
  return String(valor).toUpperCase().split(",").map((v) => v.trim()).filter((v) => permitidos.includes(v));
}

// ---------------------------------------------------------------------
// Rotas públicas
// ---------------------------------------------------------------------

// GET /api/vagas — pesquisa com filtros e paginação. Só lista vagas publicadas.
export async function listarVagas(req, res, next) {
  try {
    const filtros = req.query;
    const pagina = Math.max(1, parseInt(filtros.page, 10) || 1);
    const tamanho = Math.min(50, Math.max(1, parseInt(filtros.size, 10) || 10));

    const condicoes = ["v.status = 'PUBLICADA'"];
    const valores = [];

    if (filtros.q?.trim()) {
      const termo = `%${filtros.q.trim()}%`;
      condicoes.push("(v.titulo LIKE ? OR v.descricao LIKE ? OR e.nome_fantasia LIKE ?)");
      valores.push(termo, termo, termo);
    }
    if (filtros.cidade?.trim()) {
      condicoes.push("v.cidade LIKE ?");
      valores.push(`%${filtros.cidade.trim()}%`);
    }
    const modalidades = lerLista(filtros.modalidade, MODALIDADES);
    if (modalidades.length) {
      condicoes.push("v.modalidade IN (?)");
      valores.push(modalidades);
    }
    const contratos = lerLista(filtros.contrato, CONTRATOS);
    if (contratos.length) {
      condicoes.push("v.tipo_contrato IN (?)");
      valores.push(contratos);
    }
    if (filtros.nivel?.trim()) {
      condicoes.push("v.nivel = ?");
      valores.push(filtros.nivel.trim());
    }
    if (filtros.area?.trim()) {
      condicoes.push("v.area = ?");
      valores.push(filtros.area.trim());
    }
    if (Number(filtros.salarioMin) > 0) {
      condicoes.push("(v.salario_max IS NULL OR v.salario_max >= ?)");
      valores.push(Number(filtros.salarioMin));
    }

    const ordem = filtros.ordem === "salario"
      ? "v.salario_max IS NULL, v.salario_max DESC, v.publicada_em DESC"
      : "v.publicada_em DESC, v.id_vaga DESC";
    const base = `FROM vaga v JOIN empresa e ON e.id_empresa = v.empresa_id WHERE ${condicoes.join(" AND ")}`;

    const [contagem] = await pool.query(`SELECT COUNT(*) AS total ${base}`, valores);
    const total = contagem[0].total;

    const [linhas] = await pool.query(
      `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo
       ${base}
       ORDER BY ${ordem}
       LIMIT ? OFFSET ?`,
      [...valores, tamanho, (pagina - 1) * tamanho]
    );
    await anexarHabilidades(linhas);

    let itens = linhas.map(formatarVaga);

    // Candidato logado: mostra o match e quais vagas estão nos favoritos
    if (req.usuario?.perfil === "CANDIDATO" && itens.length > 0) {
      const perfil = (await carregarPerfis([req.usuario.candidatoId])).get(req.usuario.candidatoId);
      const [favoritas] = await pool.query(
        "SELECT vaga_id FROM favorito_vaga WHERE usuario_id = ? AND vaga_id IN (?)",
        [req.usuario.id, itens.map((v) => v.id)]
      );
      const idsFavoritos = new Set(favoritas.map((f) => f.vaga_id));
      itens = itens.map((vaga, i) => ({
        ...vaga,
        match: calcularMatch(perfil, linhas[i]),
        favorita: idsFavoritos.has(vaga.id),
      }));
    }

    return res.json({ itens, pagina, tamanho, total, totalPaginas: Math.max(1, Math.ceil(total / tamanho)) });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/vagas/filtros — opções para montar os filtros da tela
export async function listarFiltros(req, res, next) {
  try {
    const distintos = async (coluna) => {
      const [linhas] = await pool.query(
        `SELECT DISTINCT ${coluna} AS valor FROM vaga
         WHERE status = 'PUBLICADA' AND ${coluna} IS NOT NULL AND ${coluna} <> ''
         ORDER BY 1`
      );
      return linhas.map((l) => l.valor);
    };

    return res.json({
      cidades: await distintos("cidade"),
      areas: await distintos("area"),
      niveis: await distintos("nivel"),
      modalidades: MODALIDADES,
      contratos: CONTRATOS,
    });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/vagas/:id — detalhe. Vaga não publicada só aparece para a empresa dona e para o admin.
export async function detalharVaga(req, res, next) {
  try {
    const vagaId = Number(req.params.id);
    const usuario = req.usuario;

    const [linhas] = await pool.query(
      `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo,
              e.descricao AS empresa_descricao, e.setor AS empresa_setor,
              (SELECT COUNT(*) FROM candidatura c WHERE c.vaga_id = v.id_vaga) AS total_candidaturas
       FROM vaga v
       JOIN empresa e ON e.id_empresa = v.empresa_id
       WHERE v.id_vaga = ?`,
      [vagaId]
    );
    const v = linhas[0];
    const ehDona = Boolean(v && usuario?.perfil === "RECRUTADOR" && v.empresa_id === usuario.empresaId);

    if (!v || (v.status !== "PUBLICADA" && !ehDona && usuario?.perfil !== "ADMIN")) {
      return res.status(404).json({ mensagem: "Vaga não encontrada." });
    }

    await anexarHabilidades([v]);
    const [etapas] = await pool.query(
      "SELECT id_etapa AS id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem",
      [vagaId]
    );

    const vaga = {
      ...formatarVaga(v),
      descricao: v.descricao,
      encerradaEm: v.encerrada_em,
      totalCandidaturas: v.total_candidaturas,
      etapas,
      empresa: {
        id: v.empresa_id,
        nome: v.empresa_nome,
        logoUrl: v.empresa_logo,
        descricao: v.empresa_descricao,
        setor: v.empresa_setor,
      },
      podeGerenciar: ehDona,
    };

    if (usuario) {
      await pool.query("INSERT INTO visualizacao_vaga (usuario_id, vaga_id) VALUES (?, ?)", [usuario.id, vagaId]);
    }

    if (usuario?.perfil === "CANDIDATO") {
      const perfil = (await carregarPerfis([usuario.candidatoId])).get(usuario.candidatoId);
      vaga.match = calcularMatch(perfil, v);

      const [favorita] = await pool.query(
        "SELECT 1 FROM favorito_vaga WHERE usuario_id = ? AND vaga_id = ?",
        [usuario.id, vagaId]
      );
      vaga.favorita = favorita.length > 0;

      const [minha] = await pool.query(
        `SELECT c.id_candidatura, c.status, c.criada_em, e.nome AS etapa
         FROM candidatura c
         LEFT JOIN etapa_vaga e ON e.id_etapa = c.etapa_atual_id
         WHERE c.candidato_id = ? AND c.vaga_id = ?`,
        [usuario.candidatoId, vagaId]
      );
      vaga.minhaCandidatura = minha[0]
        ? { id: minha[0].id_candidatura, status: minha[0].status, etapa: minha[0].etapa, enviadaEm: minha[0].criada_em }
        : null;
    }

    return res.json(vaga);
  } catch (erro) {
    next(erro);
  }
}

// ---------------------------------------------------------------------
// Área da empresa
// ---------------------------------------------------------------------

// GET /api/vagas/minhas — vagas da empresa do recrutador, com número de candidatos
export async function listarMinhasVagas(req, res, next) {
  try {
    const valores = [req.usuario.empresaId];
    let filtroStatus = "";
    if (req.query.status) {
      filtroStatus = "AND v.status = ?";
      valores.push(String(req.query.status).toUpperCase());
    }

    const [linhas] = await pool.query(
      `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo,
              COUNT(c.id_candidatura) AS total_candidaturas,
              COALESCE(SUM(c.status IN ('ENVIADA', 'EM_ANALISE', 'ENTREVISTA')), 0) AS em_andamento
       FROM vaga v
       JOIN empresa e ON e.id_empresa = v.empresa_id
       LEFT JOIN candidatura c ON c.vaga_id = v.id_vaga
       WHERE v.empresa_id = ? ${filtroStatus}
       GROUP BY v.id_vaga
       ORDER BY FIELD(v.status, 'PUBLICADA', 'PAUSADA', 'RASCUNHO', 'ENCERRADA'), v.id_vaga DESC`,
      valores
    );
    await anexarHabilidades(linhas);

    return res.json(linhas.map((v) => ({
      ...formatarVaga(v),
      totalCandidaturas: Number(v.total_candidaturas),
      emAndamento: Number(v.em_andamento),
    })));
  } catch (erro) {
    next(erro);
  }
}

// POST /api/vagas — cria a vaga. Com { publicar: true } ela já sai publicada.
export async function criarVaga(req, res, next) {
  const { dados, detalhes } = validarVaga(req.body);
  if (detalhes) {
    return res.status(400).json({ mensagem: "Alguns campos estão inválidos.", detalhes });
  }

  const status = req.body.publicar === true ? "PUBLICADA" : "RASCUNHO";
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [vaga] = await conexao.query(
      `INSERT INTO vaga (empresa_id, recrutador_id, titulo, descricao, area, nivel, modalidade, tipo_contrato,
                         cidade, uf, salario_min, salario_max, status, publicada_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === "PUBLICADA" ? "NOW()" : "NULL"})`,
      [req.usuario.empresaId, req.usuario.recrutadorId, dados.titulo, dados.descricao, dados.area, dados.nivel,
        dados.modalidade, dados.tipoContrato, dados.cidade, dados.uf, dados.salarioMin, dados.salarioMax, status]
    );
    await salvarEtapas(conexao, vaga.insertId, dados.etapas);
    await salvarHabilidades(conexao, vaga.insertId, dados.habilidades);

    await conexao.commit();
    return res.status(201).json({ id: vaga.insertId, status });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// PUT /api/vagas/:id — edita a vaga. Etapas só mudam enquanto a vaga não tem candidaturas.
export async function atualizarVaga(req, res, next) {
  const vagaId = Number(req.params.id);
  const { dados, detalhes } = validarVaga(req.body);
  if (detalhes) {
    return res.status(400).json({ mensagem: "Alguns campos estão inválidos.", detalhes });
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const { vaga, status, mensagem } = await buscarVagaDaEmpresa(conexao, vagaId, req.usuario);
    if (!vaga) {
      await conexao.rollback();
      return res.status(status).json({ mensagem });
    }
    if (vaga.status === "ENCERRADA") {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Vaga encerrada não pode ser editada. Duplique-a para reaproveitar." });
    }

    await conexao.query(
      `UPDATE vaga SET titulo = ?, descricao = ?, area = ?, nivel = ?, modalidade = ?, tipo_contrato = ?,
                       cidade = ?, uf = ?, salario_min = ?, salario_max = ?
       WHERE id_vaga = ?`,
      [dados.titulo, dados.descricao, dados.area, dados.nivel, dados.modalidade, dados.tipoContrato,
        dados.cidade, dados.uf, dados.salarioMin, dados.salarioMax, vagaId]
    );

    const [atuais] = await conexao.query("SELECT nome FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem", [vagaId]);
    const mudouEtapas = JSON.stringify(atuais.map((e) => e.nome)) !== JSON.stringify(dados.etapas);
    if (mudouEtapas) {
      const [candidaturas] = await conexao.query("SELECT COUNT(*) AS total FROM candidatura WHERE vaga_id = ?", [vagaId]);
      if (candidaturas[0].total > 0) {
        await conexao.rollback();
        return res.status(409).json({ mensagem: "As etapas não podem mudar depois que a vaga recebeu candidaturas." });
      }
      await salvarEtapas(conexao, vagaId, dados.etapas);
    }
    await salvarHabilidades(conexao, vagaId, dados.habilidades);

    await conexao.commit();
    return res.json({ id: vagaId });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// PATCH /api/vagas/:id/status — publicar, pausar, reabrir ou encerrar
export async function alterarStatusVaga(req, res, next) {
  const vagaId = Number(req.params.id);
  const novo = String(req.body?.status || "").toUpperCase();
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const { vaga, status, mensagem } = await buscarVagaDaEmpresa(conexao, vagaId, req.usuario);
    if (!vaga) {
      await conexao.rollback();
      return res.status(status).json({ mensagem });
    }
    if (!TRANSICOES[vaga.status].includes(novo)) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: `Não é possível mudar de ${vaga.status} para ${novo || "(vazio)"}.` });
    }

    await conexao.query(
      `UPDATE vaga SET status = ?,
              publicada_em = IF(? = 'PUBLICADA' AND publicada_em IS NULL, NOW(), publicada_em),
              encerrada_em = IF(? = 'ENCERRADA', NOW(), encerrada_em)
       WHERE id_vaga = ?`,
      [novo, novo, novo, vagaId]
    );

    // Ao encerrar, quem ainda estava no processo é reprovado com o motivo "Vaga encerrada"
    let encerradas = 0;
    if (novo === "ENCERRADA") {
      const [ativas] = await conexao.query(
        `SELECT c.id_candidatura, c.etapa_atual_id, ca.usuario_id
         FROM candidatura c
         JOIN candidato ca ON ca.id_candidato = c.candidato_id
         WHERE c.vaga_id = ? AND c.status IN ('ENVIADA', 'EM_ANALISE', 'ENTREVISTA')`,
        [vagaId]
      );
      for (const c of ativas) {
        await conexao.query("UPDATE candidatura SET status = 'REPROVADA' WHERE id_candidatura = ?", [c.id_candidatura]);
        await conexao.query(
          `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status, motivo_reprovacao)
           VALUES (?, ?, ?, 'REPROVADA', 'Vaga encerrada')`,
          [c.id_candidatura, c.etapa_atual_id, req.usuario.id]
        );
        await conexao.query(
          "INSERT INTO notificacao (usuario_id, titulo, mensagem, link) VALUES (?, ?, ?, ?)",
          [c.usuario_id, "Processo encerrado", `A vaga "${vaga.titulo}" foi encerrada.`, `/vagas/${vagaId}`]
        );
      }
      encerradas = ativas.length;
    }

    await conexao.commit();
    return res.json({ id: vagaId, status: novo, candidaturasEncerradas: encerradas });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// POST /api/vagas/:id/duplicar — cria um rascunho com os mesmos dados, etapas e habilidades
export async function duplicarVaga(req, res, next) {
  const vagaId = Number(req.params.id);
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const { vaga, status, mensagem } = await buscarVagaDaEmpresa(conexao, vagaId, req.usuario);
    if (!vaga) {
      await conexao.rollback();
      return res.status(status).json({ mensagem });
    }

    const [nova] = await conexao.query(
      `INSERT INTO vaga (empresa_id, recrutador_id, titulo, descricao, area, nivel, modalidade, tipo_contrato,
                         cidade, uf, salario_min, salario_max, status)
       SELECT empresa_id, ?, LEFT(CONCAT(titulo, ' (cópia)'), 150), descricao, area, nivel, modalidade, tipo_contrato,
              cidade, uf, salario_min, salario_max, 'RASCUNHO'
       FROM vaga WHERE id_vaga = ?`,
      [req.usuario.recrutadorId, vagaId]
    );
    await conexao.query(
      `INSERT INTO etapa_vaga (vaga_id, nome, ordem, descricao)
       SELECT ?, nome, ordem, descricao FROM etapa_vaga WHERE vaga_id = ?`,
      [nova.insertId, vagaId]
    );
    await conexao.query(
      `INSERT INTO vaga_habilidade (vaga_id, habilidade_id, obrigatoria)
       SELECT ?, habilidade_id, obrigatoria FROM vaga_habilidade WHERE vaga_id = ?`,
      [nova.insertId, vagaId]
    );

    await conexao.commit();
    return res.status(201).json({ id: nova.insertId, status: "RASCUNHO" });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// DELETE /api/vagas/:id — só rascunhos podem ser excluídos
export async function excluirVaga(req, res, next) {
  const vagaId = Number(req.params.id);
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const { vaga, status, mensagem } = await buscarVagaDaEmpresa(conexao, vagaId, req.usuario);
    if (!vaga) {
      await conexao.rollback();
      return res.status(status).json({ mensagem });
    }
    if (vaga.status !== "RASCUNHO") {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Só é possível excluir rascunhos. Para tirar a vaga do ar, encerre-a." });
    }

    await conexao.query("DELETE FROM etapa_vaga WHERE vaga_id = ?", [vagaId]);
    await conexao.query("DELETE FROM favorito_vaga WHERE vaga_id = ?", [vagaId]);
    await conexao.query("DELETE FROM vaga WHERE id_vaga = ?", [vagaId]);

    await conexao.commit();
    return res.status(204).end();
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}
