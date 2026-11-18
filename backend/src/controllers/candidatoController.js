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

// ---------------------------------------------------------------------
// Meu currículo
// ---------------------------------------------------------------------

const NIVEIS_HABILIDADE = ["BASICO", "INTERMEDIARIO", "AVANCADO"];

// Quanto do currículo está preenchido (o candidato precisa de 70% para se candidatar)
function calcularPercentual(dados) {
  let total = 0;
  const pessoais = [dados.nome, dados.telefone, dados.cidade, dados.uf, dados.dataNascimento];
  if (pessoais.every(Boolean)) total += 20;
  if ((dados.resumo || "").length >= 30) total += 20;
  if (dados.pretensaoSalarial !== null) total += 10;
  if (dados.formacoes.length > 0) total += 20;
  if (dados.experiencias.length > 0) total += 15;
  if (dados.habilidades.length > 0) total += 15;
  return total;
}

async function buscarCurriculo(candidatoId) {
  const [candidatos] = await pool.query(
    `SELECT c.nome, c.telefone, c.cidade, c.uf, DATE_FORMAT(c.data_nascimento, '%Y-%m-%d') AS dataNascimento,
            u.email, cu.id_curriculo, cu.resumo, cu.pretensao_salarial, cu.percentual_preenchido
     FROM candidato c
     JOIN usuario u ON u.id_usuario = c.usuario_id
     LEFT JOIN curriculo cu ON cu.candidato_id = c.id_candidato
     WHERE c.id_candidato = ?`,
    [candidatoId]
  );
  const c = candidatos[0];

  const curriculo = {
    dados: {
      nome: c.nome,
      email: c.email,
      telefone: c.telefone || "",
      cidade: c.cidade || "",
      uf: c.uf || "",
      dataNascimento: c.dataNascimento || "",
    },
    resumo: c.resumo || "",
    pretensaoSalarial: c.pretensao_salarial === null ? null : Number(c.pretensao_salarial),
    percentual: c.percentual_preenchido || 0,
    formacoes: [],
    experiencias: [],
    habilidades: [],
  };

  if (c.id_curriculo) {
    [curriculo.formacoes] = await pool.query(
      `SELECT instituicao, curso, nivel, DATE_FORMAT(inicio, '%Y-%m-%d') AS inicio, DATE_FORMAT(fim, '%Y-%m-%d') AS fim
       FROM formacao WHERE curriculo_id = ? ORDER BY inicio DESC`,
      [c.id_curriculo]
    );
    const [experiencias] = await pool.query(
      `SELECT empresa, cargo, descricao, DATE_FORMAT(inicio, '%Y-%m-%d') AS inicio, DATE_FORMAT(fim, '%Y-%m-%d') AS fim, atual
       FROM experiencia WHERE curriculo_id = ? ORDER BY inicio DESC`,
      [c.id_curriculo]
    );
    curriculo.experiencias = experiencias.map((e) => ({ ...e, atual: Boolean(e.atual) }));
    [curriculo.habilidades] = await pool.query(
      `SELECT h.nome, ch.nivel
       FROM curriculo_habilidade ch
       JOIN habilidade h ON h.id_habilidade = ch.habilidade_id
       WHERE ch.curriculo_id = ? ORDER BY h.nome`,
      [c.id_curriculo]
    );
  }

  return curriculo;
}

// GET /api/candidato/curriculo
export async function obterCurriculo(req, res, next) {
  try {
    return res.json(await buscarCurriculo(req.usuario.candidatoId));
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/candidato/curriculo — salva dados pessoais, resumo, formações, experiências e habilidades
export async function salvarCurriculo(req, res, next) {
  const corpo = req.body || {};
  const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");
  const dataOuNulo = (valor) => (/^\d{4}-\d{2}-\d{2}$/.test(texto(valor)) ? texto(valor) : null);
  const lista = (valor) => (Array.isArray(valor) ? valor : []);

  const dados = {
    nome: texto(corpo.dados?.nome),
    telefone: texto(corpo.dados?.telefone).replace(/\D/g, ""),
    cidade: texto(corpo.dados?.cidade),
    uf: texto(corpo.dados?.uf).toUpperCase(),
    dataNascimento: dataOuNulo(corpo.dados?.dataNascimento),
    resumo: texto(corpo.resumo).slice(0, 3000),
    pretensaoSalarial: corpo.pretensaoSalarial === "" || corpo.pretensaoSalarial === null || corpo.pretensaoSalarial === undefined
      ? null
      : Number(corpo.pretensaoSalarial),
    formacoes: lista(corpo.formacoes)
      .map((f) => ({ instituicao: texto(f.instituicao), curso: texto(f.curso), nivel: texto(f.nivel) || null, inicio: dataOuNulo(f.inicio), fim: dataOuNulo(f.fim) }))
      .filter((f) => f.instituicao || f.curso),
    experiencias: lista(corpo.experiencias)
      .map((e) => ({ empresa: texto(e.empresa), cargo: texto(e.cargo), descricao: texto(e.descricao) || null, inicio: dataOuNulo(e.inicio), fim: e.atual ? null : dataOuNulo(e.fim), atual: Boolean(e.atual) }))
      .filter((e) => e.empresa || e.cargo),
    habilidades: lista(corpo.habilidades)
      .map((h) => ({ nome: texto(h.nome), nivel: NIVEIS_HABILIDADE.includes(h.nivel) ? h.nivel : "BASICO" }))
      .filter((h) => h.nome),
  };

  const detalhes = {};
  if (!dados.nome) detalhes.nome = "Informe seu nome.";
  if (dados.uf && !/^[A-Z]{2}$/.test(dados.uf)) detalhes.uf = "Use a sigla do estado, ex.: SP.";
  if (dados.pretensaoSalarial !== null && (!Number.isFinite(dados.pretensaoSalarial) || dados.pretensaoSalarial < 0)) {
    detalhes.pretensaoSalarial = "Informe um valor positivo.";
  }
  if (dados.formacoes.some((f) => !f.instituicao || !f.curso)) detalhes.formacoes = "Preencha a instituição e o curso de cada formação.";
  if (dados.experiencias.some((e) => !e.empresa || !e.cargo)) detalhes.experiencias = "Preencha a empresa e o cargo de cada experiência.";
  if (dados.habilidades.length > 30) detalhes.habilidades = "Use no máximo 30 habilidades.";

  if (Object.keys(detalhes).length > 0) {
    return res.status(400).json({ mensagem: "Alguns campos estão inválidos.", detalhes });
  }

  const candidatoId = req.usuario.candidatoId;
  const percentual = calcularPercentual(dados);
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    await conexao.query(
      `UPDATE candidato SET nome = ?, telefone = ?, cidade = ?, uf = ?, data_nascimento = ?
       WHERE id_candidato = ?`,
      [dados.nome, dados.telefone || null, dados.cidade || null, dados.uf || null, dados.dataNascimento, candidatoId]
    );

    const [existente] = await conexao.query("SELECT id_curriculo FROM curriculo WHERE candidato_id = ?", [candidatoId]);
    let curriculoId = existente[0]?.id_curriculo;
    if (curriculoId) {
      await conexao.query(
        "UPDATE curriculo SET resumo = ?, pretensao_salarial = ?, percentual_preenchido = ? WHERE id_curriculo = ?",
        [dados.resumo || null, dados.pretensaoSalarial, percentual, curriculoId]
      );
    } else {
      const [novo] = await conexao.query(
        "INSERT INTO curriculo (candidato_id, resumo, pretensao_salarial, percentual_preenchido) VALUES (?, ?, ?, ?)",
        [candidatoId, dados.resumo || null, dados.pretensaoSalarial, percentual]
      );
      curriculoId = novo.insertId;
    }

    await conexao.query("DELETE FROM formacao WHERE curriculo_id = ?", [curriculoId]);
    for (const f of dados.formacoes) {
      await conexao.query(
        "INSERT INTO formacao (curriculo_id, instituicao, curso, nivel, inicio, fim) VALUES (?, ?, ?, ?, ?, ?)",
        [curriculoId, f.instituicao, f.curso, f.nivel, f.inicio, f.fim]
      );
    }

    await conexao.query("DELETE FROM experiencia WHERE curriculo_id = ?", [curriculoId]);
    for (const e of dados.experiencias) {
      await conexao.query(
        "INSERT INTO experiencia (curriculo_id, empresa, cargo, descricao, inicio, fim, atual) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [curriculoId, e.empresa, e.cargo, e.descricao, e.inicio, e.fim, e.atual ? 1 : 0]
      );
    }

    await conexao.query("DELETE FROM curriculo_habilidade WHERE curriculo_id = ?", [curriculoId]);
    for (const h of dados.habilidades) {
      const [achada] = await conexao.query("SELECT id_habilidade FROM habilidade WHERE nome = ?", [h.nome]);
      let habilidadeId = achada[0]?.id_habilidade;
      if (!habilidadeId) {
        const [nova] = await conexao.query("INSERT INTO habilidade (nome) VALUES (?)", [h.nome]);
        habilidadeId = nova.insertId;
      }
      await conexao.query(
        "INSERT IGNORE INTO curriculo_habilidade (curriculo_id, habilidade_id, nivel) VALUES (?, ?, ?)",
        [curriculoId, habilidadeId, h.nivel]
      );
    }

    await conexao.commit();
    return res.json(await buscarCurriculo(candidatoId));
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// ---------------------------------------------------------------------
// Minhas candidaturas e histórico
// ---------------------------------------------------------------------

// GET /api/candidato/candidaturas
export async function listarMinhasCandidaturas(req, res, next) {
  try {
    const [candidaturas] = await pool.query(
      `SELECT ca.id_candidatura AS id, ca.status, ca.criada_em AS enviadaEm,
              v.id_vaga AS vagaId, v.titulo AS vaga, v.status AS vagaStatus,
              e.nome_fantasia AS empresa,
              et.nome AS etapa, et.ordem AS etapaOrdem,
              (SELECT COUNT(*) FROM etapa_vaga x WHERE x.vaga_id = v.id_vaga) AS totalEtapas
       FROM candidatura ca
       JOIN vaga v ON v.id_vaga = ca.vaga_id
       JOIN empresa e ON e.id_empresa = v.empresa_id
       LEFT JOIN etapa_vaga et ON et.id_etapa = ca.etapa_atual_id
       WHERE ca.candidato_id = ?
       ORDER BY ca.criada_em DESC`,
      [req.usuario.candidatoId]
    );

    return res.json(candidaturas);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/candidato/historico — vagas que o candidato abriu recentemente
export async function listarHistorico(req, res, next) {
  try {
    const [vagas] = await pool.query(
      `SELECT v.id_vaga AS id, v.titulo, v.modalidade, v.cidade, v.uf, v.status,
              e.nome_fantasia AS empresa, MAX(h.visualizada_em) AS vistaEm
       FROM visualizacao_vaga h
       JOIN vaga v ON v.id_vaga = h.vaga_id
       JOIN empresa e ON e.id_empresa = v.empresa_id
       WHERE h.usuario_id = ?
       GROUP BY v.id_vaga
       ORDER BY vistaEm DESC
       LIMIT 20`,
      [req.usuario.id]
    );

    return res.json(vagas);
  } catch (erro) {
    next(erro);
  }
}
