import { pool } from "../config/database.js";
import { calcularMatch, carregarPerfis, anexarHabilidades } from "./vagasController.js";

const MOTIVOS_REPROVACAO = [
  "Perfil não atende aos requisitos",
  "Pretensão salarial acima da faixa",
  "Não compareceu à etapa",
  "Desempenho abaixo do esperado no teste",
  "Vaga preenchida por outro candidato",
  "Outro motivo",
];

const ATIVOS = ["ENVIADA", "EM_ANALISE", "ENTREVISTA"];
const FINAIS = ["APROVADA", "REPROVADA", "DESISTENCIA"];
const PERCENTUAL_MINIMO = 70;

// Status da candidatura conforme a etapa em que ela está
function statusDaEtapa(etapa, ordem) {
  if (/entrevista/i.test(etapa.nome)) return "ENTREVISTA";
  return ordem === 1 ? "ENVIADA" : "EM_ANALISE";
}

const lerJson = (valor) => {
  if (!valor) return {};
  if (typeof valor === "object") return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return {};
  }
};

// Dados atuais do currículo do candidato, no mesmo formato da cópia guardada na candidatura
export async function montarCurriculo(conexao, candidatoId) {
  const [linhas] = await conexao.query(
    `SELECT c.nome, c.cidade, c.uf, c.telefone, u.email,
            cu.id_curriculo, cu.resumo, cu.pretensao_salarial, cu.percentual_preenchido
     FROM candidato c
     JOIN usuario u ON u.id_usuario = c.usuario_id
     LEFT JOIN curriculo cu ON cu.candidato_id = c.id_candidato
     WHERE c.id_candidato = ?`,
    [candidatoId]
  );
  const c = linhas[0];
  if (!c) return { percentual: 0, curriculo: {} };

  const curriculo = {
    nome: c.nome,
    email: c.email,
    telefone: c.telefone,
    cidade: c.cidade,
    uf: c.uf,
    resumo: c.resumo,
    pretensaoSalarial: c.pretensao_salarial === null ? null : Number(c.pretensao_salarial),
    formacoes: [],
    experiencias: [],
    habilidades: [],
  };

  if (c.id_curriculo) {
    [curriculo.formacoes] = await conexao.query(
      `SELECT instituicao, curso, nivel, DATE_FORMAT(inicio, '%Y-%m-%d') AS inicio, DATE_FORMAT(fim, '%Y-%m-%d') AS fim
       FROM formacao WHERE curriculo_id = ? ORDER BY inicio DESC`,
      [c.id_curriculo]
    );
    const [experiencias] = await conexao.query(
      `SELECT empresa, cargo, descricao, DATE_FORMAT(inicio, '%Y-%m-%d') AS inicio, DATE_FORMAT(fim, '%Y-%m-%d') AS fim, atual
       FROM experiencia WHERE curriculo_id = ? ORDER BY inicio DESC`,
      [c.id_curriculo]
    );
    curriculo.experiencias = experiencias.map((e) => ({ ...e, atual: Boolean(e.atual) }));
    [curriculo.habilidades] = await conexao.query(
      `SELECT h.nome, ch.nivel
       FROM curriculo_habilidade ch
       JOIN habilidade h ON h.id_habilidade = ch.habilidade_id
       WHERE ch.curriculo_id = ? ORDER BY h.nome`,
      [c.id_curriculo]
    );
  }

  return { percentual: c.percentual_preenchido || 0, curriculo };
}

// Busca a candidatura com a vaga e o usuário do candidato
async function buscarCandidatura(conexao, candidaturaId) {
  const [linhas] = await conexao.query(
    `SELECT c.*, v.titulo AS vaga_titulo, v.empresa_id, v.status AS vaga_status, ca.usuario_id AS candidato_usuario_id
     FROM candidatura c
     JOIN vaga v ON v.id_vaga = c.vaga_id
     JOIN candidato ca ON ca.id_candidato = c.candidato_id
     WHERE c.id_candidatura = ?`,
    [candidaturaId]
  );
  return linhas[0];
}

// GET /api/candidaturas/motivos-reprovacao
export function listarMotivos(req, res) {
  return res.json(MOTIVOS_REPROVACAO);
}

// POST /api/vagas/:id/candidaturas — o candidato se candidata
export async function candidatar(req, res, next) {
  const vagaId = Number(req.params.id);
  const carta = typeof req.body?.cartaApresentacao === "string" ? req.body.cartaApresentacao.trim().slice(0, 3000) : "";
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [vagas] = await conexao.query("SELECT id_vaga, titulo, status, recrutador_id FROM vaga WHERE id_vaga = ?", [vagaId]);
    const vaga = vagas[0];
    if (!vaga) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: "Vaga não encontrada." });
    }
    if (vaga.status !== "PUBLICADA") {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Esta vaga não está recebendo candidaturas." });
    }

    const { percentual, curriculo } = await montarCurriculo(conexao, req.usuario.candidatoId);
    if (percentual < PERCENTUAL_MINIMO) {
      await conexao.rollback();
      return res.status(409).json({
        mensagem: `Complete pelo menos ${PERCENTUAL_MINIMO}% do currículo para se candidatar (o seu está em ${percentual}%).`,
      });
    }

    const [etapas] = await conexao.query(
      "SELECT id_etapa, nome FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem LIMIT 1",
      [vagaId]
    );
    const primeira = etapas[0] || null;

    let candidatura;
    try {
      [candidatura] = await conexao.query(
        `INSERT INTO candidatura (candidato_id, vaga_id, etapa_atual_id, status, carta_apresentacao, curriculo_snapshot)
         VALUES (?, ?, ?, 'ENVIADA', ?, ?)`,
        [req.usuario.candidatoId, vagaId, primeira?.id_etapa ?? null, carta || null, JSON.stringify(curriculo)]
      );
    } catch (erro) {
      if (erro.code === "ER_DUP_ENTRY") {
        await conexao.rollback();
        return res.status(409).json({ mensagem: "Você já se candidatou a esta vaga." });
      }
      throw erro;
    }

    await conexao.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status)
       VALUES (?, ?, ?, 'ENVIADA')`,
      [candidatura.insertId, primeira?.id_etapa ?? null, req.usuario.id]
    );

    const [recrutador] = await conexao.query("SELECT usuario_id FROM recrutador WHERE id_recrutador = ?", [vaga.recrutador_id]);
    if (recrutador[0]) {
      await conexao.query(
        "INSERT INTO notificacao (usuario_id, titulo, mensagem, link) VALUES (?, ?, ?, ?)",
        [recrutador[0].usuario_id, "Nova candidatura", `${curriculo.nome} se candidatou à vaga "${vaga.titulo}".`,
          `/empresa/vagas/${vagaId}/processo`]
      );
    }

    await conexao.commit();
    return res.status(201).json({ id: candidatura.insertId, status: "ENVIADA", etapa: primeira?.nome || null });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// GET /api/vagas/:id/candidaturas — quadro do processo seletivo, agrupado por etapa
export async function listarCandidaturasDaVaga(req, res, next) {
  try {
    const vagaId = Number(req.params.id);
    const [vagas] = await pool.query("SELECT * FROM vaga WHERE id_vaga = ?", [vagaId]);
    const vaga = vagas[0];

    if (!vaga) return res.status(404).json({ mensagem: "Vaga não encontrada." });
    if (vaga.empresa_id !== req.usuario.empresaId) {
      return res.status(403).json({ mensagem: "Só a empresa dona da vaga vê os candidatos." });
    }

    const [etapas] = await pool.query(
      "SELECT id_etapa AS id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem",
      [vagaId]
    );
    const [linhas] = await pool.query(
      `SELECT c.id_candidatura, c.candidato_id, c.etapa_atual_id, c.status, c.criada_em, c.atualizada_em,
              ca.nome, ca.cidade, ca.uf
       FROM candidatura c
       JOIN candidato ca ON ca.id_candidato = c.candidato_id
       WHERE c.vaga_id = ?
       ORDER BY c.criada_em`,
      [vagaId]
    );

    await anexarHabilidades([vaga]);
    const perfis = await carregarPerfis([...new Set(linhas.map((l) => l.candidato_id))]);

    const cartao = (l) => ({
      id: l.id_candidatura,
      candidato: { id: l.candidato_id, nome: l.nome, cidade: l.cidade, uf: l.uf },
      status: l.status,
      etapaId: l.etapa_atual_id ?? etapas[0]?.id ?? null,
      match: calcularMatch(perfis.get(l.candidato_id), vaga),
      enviadaEm: l.criada_em,
      atualizadaEm: l.atualizada_em,
    });

    const ativas = linhas.filter((l) => ATIVOS.includes(l.status)).map(cartao);
    const porMatch = (lista) => lista.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));

    return res.json({
      vaga: { id: vaga.id_vaga, titulo: vaga.titulo, status: vaga.status },
      etapas: etapas.map((e) => ({ ...e, candidaturas: porMatch(ativas.filter((c) => c.etapaId === e.id)) })),
      finalizadas: {
        APROVADA: linhas.filter((l) => l.status === "APROVADA").map(cartao),
        REPROVADA: linhas.filter((l) => l.status === "REPROVADA").map(cartao),
        DESISTENCIA: linhas.filter((l) => l.status === "DESISTENCIA").map(cartao),
      },
      total: linhas.length,
    });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/candidaturas/:id — currículo enviado e linha do tempo (empresa dona ou o próprio candidato)
export async function detalharCandidatura(req, res, next) {
  try {
    const candidaturaId = Number(req.params.id);
    const usuario = req.usuario;
    const c = await buscarCandidatura(pool, candidaturaId);

    if (!c) return res.status(404).json({ mensagem: "Candidatura não encontrada." });

    const ehEmpresa = usuario.perfil === "RECRUTADOR" && usuario.empresaId === c.empresa_id;
    const ehDono = usuario.perfil === "CANDIDATO" && usuario.candidatoId === c.candidato_id;
    if (!ehEmpresa && !ehDono) {
      return res.status(403).json({ mensagem: "Você não tem permissão para ver esta candidatura." });
    }

    const [etapas] = await pool.query(
      "SELECT id_etapa AS id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem",
      [c.vaga_id]
    );
    const [historico] = await pool.query(
      `SELECT h.id_historico AS id, h.status, h.feedback, h.motivo_reprovacao AS motivo, h.data_alteracao AS data,
              e.nome AS etapa, COALESCE(r.nome, ca.nome) AS autor
       FROM historico_candidatura h
       LEFT JOIN etapa_vaga e ON e.id_etapa = h.etapa_id
       LEFT JOIN recrutador r ON r.usuario_id = h.autor_usuario_id
       LEFT JOIN candidato ca ON ca.usuario_id = h.autor_usuario_id
       WHERE h.candidatura_id = ?
       ORDER BY h.data_alteracao, h.id_historico`,
      [candidaturaId]
    );

    // Completa a cópia guardada com os dados atuais, caso ela tenha sido salva incompleta
    const { curriculo: atual } = await montarCurriculo(pool, c.candidato_id);

    return res.json({
      id: c.id_candidatura,
      status: c.status,
      vaga: { id: c.vaga_id, titulo: c.vaga_titulo, status: c.vaga_status },
      etapaAtualId: c.etapa_atual_id ?? etapas[0]?.id ?? null,
      etapas,
      cartaApresentacao: c.carta_apresentacao,
      curriculo: { ...atual, ...lerJson(c.curriculo_snapshot) },
      enviadaEm: c.criada_em,
      historico,
    });
  } catch (erro) {
    next(erro);
  }
}

// PATCH /api/candidaturas/:id/etapa — a empresa movimenta o candidato
//   { acao: "avancar" }                      vai para a próxima etapa
//   { acao: "mover", etapaId }               vai para uma etapa específica (arrastar no quadro)
//   { acao: "reprovar", motivo, feedback? }  encerra como reprovada (motivo obrigatório)
//   { acao: "contratar", feedback? }         encerra como aprovada (só na última etapa)
export async function movimentarCandidatura(req, res, next) {
  const candidaturaId = Number(req.params.id);
  const corpo = req.body || {};
  const acao = corpo.acao;
  const feedback = typeof corpo.feedback === "string" ? corpo.feedback.trim().slice(0, 2000) || null : null;

  if (!["avancar", "mover", "reprovar", "contratar"].includes(acao)) {
    return res.status(400).json({ mensagem: "Ação inválida. Use avancar, mover, reprovar ou contratar." });
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const c = await buscarCandidatura(conexao, candidaturaId);
    if (!c) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: "Candidatura não encontrada." });
    }
    if (c.empresa_id !== req.usuario.empresaId) {
      await conexao.rollback();
      return res.status(403).json({ mensagem: "Só a empresa dona da vaga move candidatos." });
    }
    if (FINAIS.includes(c.status)) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Esta candidatura já foi finalizada e não pode mais ser alterada." });
    }

    const [etapas] = await conexao.query(
      "SELECT id_etapa, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem",
      [c.vaga_id]
    );
    const atual = etapas.find((e) => e.id_etapa === c.etapa_atual_id) || etapas[0];
    const ultima = etapas[etapas.length - 1];

    if (!atual) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Esta vaga não tem etapas cadastradas." });
    }

    let novaEtapa = atual;
    let novoStatus;
    let motivo = null;
    let aviso;

    if (acao === "avancar") {
      novaEtapa = etapas.find((e) => e.ordem > atual.ordem);
      if (!novaEtapa) {
        await conexao.rollback();
        return res.status(409).json({ mensagem: 'O candidato já está na última etapa. Use "contratar".' });
      }
      novoStatus = statusDaEtapa(novaEtapa, novaEtapa.ordem);
      aviso = `Você avançou para a etapa "${novaEtapa.nome}" na vaga "${c.vaga_titulo}".`;
    } else if (acao === "mover") {
      novaEtapa = etapas.find((e) => e.id_etapa === Number(corpo.etapaId));
      if (!novaEtapa) {
        await conexao.rollback();
        return res.status(400).json({ mensagem: "Essa etapa não pertence a esta vaga." });
      }
      if (novaEtapa.id_etapa === atual.id_etapa) {
        await conexao.rollback();
        return res.json({ id: c.id_candidatura, status: c.status, etapaId: atual.id_etapa, etapa: atual.nome });
      }
      novoStatus = statusDaEtapa(novaEtapa, novaEtapa.ordem);
      aviso = `Sua candidatura para "${c.vaga_titulo}" está agora na etapa "${novaEtapa.nome}".`;
    } else if (acao === "reprovar") {
      motivo = typeof corpo.motivo === "string" ? corpo.motivo.trim() : "";
      if (!motivo) {
        await conexao.rollback();
        return res.status(400).json({ mensagem: "Escolha o motivo da reprovação.", detalhes: { motivo: "Obrigatório." } });
      }
      novoStatus = "REPROVADA";
      aviso = `O processo seletivo da vaga "${c.vaga_titulo}" foi encerrado para você.`;
    } else {
      if (atual.id_etapa !== ultima.id_etapa) {
        await conexao.rollback();
        return res.status(409).json({ mensagem: `Para contratar, o candidato precisa estar na última etapa ("${ultima.nome}").` });
      }
      novoStatus = "APROVADA";
      aviso = `Parabéns! Você foi aprovado(a) na vaga "${c.vaga_titulo}".`;
    }

    await conexao.query(
      "UPDATE candidatura SET etapa_atual_id = ?, status = ? WHERE id_candidatura = ?",
      [novaEtapa.id_etapa, novoStatus, c.id_candidatura]
    );
    await conexao.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status, feedback, motivo_reprovacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [c.id_candidatura, novaEtapa.id_etapa, req.usuario.id, novoStatus, feedback, motivo]
    );
    await conexao.query(
      "INSERT INTO notificacao (usuario_id, titulo, mensagem, link) VALUES (?, ?, ?, ?)",
      [c.candidato_usuario_id, "Atualização da candidatura", aviso, `/vagas/${c.vaga_id}`]
    );

    await conexao.commit();
    return res.json({ id: c.id_candidatura, status: novoStatus, etapaId: novaEtapa.id_etapa, etapa: novaEtapa.nome });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}

// DELETE /api/candidaturas/:id — o candidato desiste
export async function desistirCandidatura(req, res, next) {
  const candidaturaId = Number(req.params.id);
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const c = await buscarCandidatura(conexao, candidaturaId);
    if (!c || c.candidato_id !== req.usuario.candidatoId) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: "Candidatura não encontrada." });
    }
    if (FINAIS.includes(c.status)) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: "Esta candidatura já foi finalizada." });
    }

    await conexao.query("UPDATE candidatura SET status = 'DESISTENCIA' WHERE id_candidatura = ?", [candidaturaId]);
    await conexao.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status)
       VALUES (?, ?, ?, 'DESISTENCIA')`,
      [candidaturaId, c.etapa_atual_id, req.usuario.id]
    );

    await conexao.commit();
    return res.json({ id: candidaturaId, status: "DESISTENCIA" });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally {
    conexao.release();
  }
}
