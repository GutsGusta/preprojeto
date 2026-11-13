const { query, transacao } = require('../config/db');
const { naoEncontrado, proibido, conflito, invalido, lerId } = require('../middlewares/erros');
const { calcularMatch, carregarPerfis, anexarHabilidades } = require('./vagasController');

const MOTIVOS_REPROVACAO = [
  'Perfil não atende aos requisitos',
  'Pretensão salarial acima da faixa',
  'Não compareceu à etapa',
  'Desempenho abaixo do esperado no teste',
  'Vaga preenchida por outro candidato',
  'Outro motivo',
];

const ATIVOS = ['EM_ANDAMENTO', 'APROVADO_ETAPA'];
const FINAIS = ['CONTRATADO', 'REPROVADO', 'DESISTIU'];
const PERCENTUAL_MINIMO = 70;

const notificar = (db, usuarioId, titulo, mensagem, link) =>
  db.query('INSERT INTO notificacao (usuario_id, titulo, mensagem, link) VALUES (?, ?, ?, ?)', [usuarioId, titulo, mensagem, link]);

// Cópia do currículo no momento da candidatura (RN06)
async function montarSnapshot(db, candidatoId) {
  const [c] = await db.query(
    `SELECT c.nome, c.cidade, c.uf, c.telefone, u.email,
            cu.id AS curriculo_id, cu.resumo, cu.pretensao_salarial, cu.percentual_preenchido, cu.arquivo_pdf_url
       FROM candidato c JOIN usuario u ON u.id = c.usuario_id
       LEFT JOIN curriculo cu ON cu.candidato_id = c.id
      WHERE c.id = ?`, [candidatoId]);
  if (!c || !c.curriculo_id) return { percentual: 0 };
  const lista = (sql) => db.query(sql, [c.curriculo_id]);
  return {
    percentual: c.percentual_preenchido,
    snapshot: {
      nome: c.nome, email: c.email, telefone: c.telefone, cidade: c.cidade, uf: c.uf,
      resumo: c.resumo, pretensaoSalarial: c.pretensao_salarial, arquivoPdfUrl: c.arquivo_pdf_url,
      formacoes: await lista('SELECT instituicao, curso, nivel, inicio, fim FROM formacao WHERE curriculo_id = ? ORDER BY inicio DESC'),
      experiencias: (await lista('SELECT empresa, cargo, descricao, inicio, fim, atual FROM experiencia WHERE curriculo_id = ? ORDER BY inicio DESC'))
        .map((e) => ({ ...e, atual: Boolean(e.atual) })),
      habilidades: await lista(`SELECT h.nome, ch.nivel FROM curriculo_habilidade ch JOIN habilidade h ON h.id = ch.habilidade_id
                                 WHERE ch.curriculo_id = ? ORDER BY h.nome`),
    },
  };
}

// O JSON vem como objeto no MySQL; em bancos compatíveis (MariaDB) pode vir como texto
const lerJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

// Candidatura com a vaga e o usuário do candidato
async function carregar(db, candidaturaId, travar = false) {
  const [c] = await db.query(
    `SELECT c.*, v.titulo AS vaga_titulo, v.empresa_id, v.status AS vaga_status, ca.usuario_id AS candidato_usuario_id
       FROM candidatura c
       JOIN vaga v ON v.id = c.vaga_id
       JOIN candidato ca ON ca.id = c.candidato_id
      WHERE c.id = ? ${travar ? 'FOR UPDATE' : ''}`, [candidaturaId]);
  if (!c) throw naoEncontrado('Candidatura não encontrada.');
  return c;
}

// POST /api/vagas/:id/candidaturas — o candidato se candidata (RF09)
async function candidatar(req, res) {
  const vagaId = lerId(req.params.id);
  const usuario = req.usuario;
  const carta = typeof req.body?.cartaApresentacao === 'string' ? req.body.cartaApresentacao.trim().slice(0, 3000) : '';

  const resultado = await transacao(async (db) => {
    const [vaga] = await db.query('SELECT id, titulo, status, recrutador_id FROM vaga WHERE id = ? FOR SHARE', [vagaId]);
    if (!vaga) throw naoEncontrado('Vaga não encontrada.');
    if (vaga.status !== 'ABERTA') throw conflito('vaga_fechada', 'Esta vaga não está recebendo candidaturas.');     // RN10

    const { percentual, snapshot } = await montarSnapshot(db, usuario.candidatoId);
    if (percentual < PERCENTUAL_MINIMO) {                                                                       // RN05
      throw conflito('curriculo_incompleto',
        `Complete pelo menos ${PERCENTUAL_MINIMO}% do currículo para se candidatar (o seu está em ${percentual}%).`);
    }

    const [primeira] = await db.query('SELECT id, nome FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem LIMIT 1', [vagaId]);

    let candidaturaId;
    try {
      candidaturaId = (await db.query(
        `INSERT INTO candidatura (candidato_id, vaga_id, etapa_atual_id, carta_apresentacao, curriculo_snapshot)
         VALUES (?, ?, ?, ?, ?)`,
        [usuario.candidatoId, vagaId, primeira.id, carta || null, JSON.stringify(snapshot)])).insertId;
    } catch (erro) {
      if (erro.code === 'ER_DUP_ENTRY') throw conflito('ja_candidatou', 'Você já se candidatou a esta vaga.'); // RN10
      throw erro;
    }

    // RN11: começa na primeira etapa, em andamento
    await db.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status) VALUES (?, ?, ?, 'EM_ANDAMENTO')`,
      [candidaturaId, primeira.id, usuario.id]);

    const [recrutador] = await db.query('SELECT usuario_id FROM recrutador WHERE id = ?', [vaga.recrutador_id]);
    if (recrutador) {
      await notificar(db, recrutador.usuario_id, 'Nova candidatura',
        `${snapshot.nome} se candidatou à vaga "${vaga.titulo}".`, `/empresa/vagas/${vagaId}/processo`);
    }
    return { id: candidaturaId, status: 'EM_ANDAMENTO', etapa: primeira.nome };
  });

  res.status(201).json(resultado);
}

// GET /api/vagas/:id/candidaturas — quadro do processo seletivo, agrupado por etapa
async function listarPorVaga(req, res) {
  const vagaId = lerId(req.params.id);
  const [vaga] = await query('SELECT * FROM vaga WHERE id = ?', [vagaId]);
  if (!vaga) throw naoEncontrado('Vaga não encontrada.');
  if (vaga.empresa_id !== req.usuario.empresaId) throw proibido('Só a empresa dona da vaga vê os candidatos.');

  const etapas = await query('SELECT id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem', [vagaId]);
  const linhas = await query(
    `SELECT c.id, c.candidato_id, c.etapa_atual_id, c.status, c.criado_em, c.atualizado_em, ca.nome, ca.cidade, ca.uf
       FROM candidatura c JOIN candidato ca ON ca.id = c.candidato_id
      WHERE c.vaga_id = ? ORDER BY c.criado_em`, [vagaId]);

  // Match de cada candidato com esta vaga, calculado pelo currículo atual
  await anexarHabilidades([vaga]);
  const perfis = await carregarPerfis([...new Set(linhas.map((l) => l.candidato_id))]);

  const cartao = (l) => ({
    id: l.id,
    candidato: { id: l.candidato_id, nome: l.nome, cidade: l.cidade, uf: l.uf },
    status: l.status,
    etapaId: l.etapa_atual_id,
    match: calcularMatch(perfis.get(l.candidato_id), vaga),
    enviadaEm: l.criado_em,
    atualizadaEm: l.atualizado_em,
  });
  const ativos = linhas.filter((l) => ATIVOS.includes(l.status)).map(cartao);
  const porMatch = (lista) => lista.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));

  res.json({
    vaga: { id: vaga.id, titulo: vaga.titulo, status: vaga.status },
    etapas: etapas.map((e) => ({ ...e, candidaturas: porMatch(ativos.filter((c) => c.etapaId === e.id)) })),
    finalizadas: {
      CONTRATADO: linhas.filter((l) => l.status === 'CONTRATADO').map(cartao),
      REPROVADO: linhas.filter((l) => l.status === 'REPROVADO').map(cartao),
      DESISTIU: linhas.filter((l) => l.status === 'DESISTIU').map(cartao),
    },
    total: linhas.length,
  });
}

// GET /api/candidaturas/motivos-reprovacao
function motivos(req, res) {
  res.json(MOTIVOS_REPROVACAO);
}

// GET /api/candidaturas/:id — currículo enviado e linha do tempo (empresa dona ou o próprio candidato)
async function detalhar(req, res) {
  const candidaturaId = lerId(req.params.id);
  const usuario = req.usuario;
  const c = await carregar({ query }, candidaturaId);
  const ehEmpresa = usuario.perfil === 'RECRUTADOR' && usuario.empresaId === c.empresa_id;
  const ehDono = usuario.perfil === 'CANDIDATO' && usuario.candidatoId === c.candidato_id;
  if (!ehEmpresa && !ehDono) throw proibido();

  const etapas = await query('SELECT id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem', [c.vaga_id]);
  const historico = await query(
    `SELECT h.id, h.status, h.feedback, h.motivo_reprovacao, h.criado_em, e.nome AS etapa,
            COALESCE(r.nome, ca.nome) AS autor
       FROM historico_candidatura h
       JOIN etapa_vaga e ON e.id = h.etapa_id
       LEFT JOIN recrutador r ON r.usuario_id = h.autor_usuario_id
       LEFT JOIN candidato ca ON ca.usuario_id = h.autor_usuario_id
      WHERE h.candidatura_id = ?
      ORDER BY h.criado_em, h.id`, [candidaturaId]);

  res.json({
    id: c.id,
    status: c.status,
    vaga: { id: c.vaga_id, titulo: c.vaga_titulo, status: c.vaga_status },
    etapaAtualId: c.etapa_atual_id,
    etapas,
    cartaApresentacao: c.carta_apresentacao,
    curriculo: lerJson(c.curriculo_snapshot),
    enviadaEm: c.criado_em,
    historico: historico.map((h) => ({
      id: h.id, status: h.status, etapa: h.etapa, feedback: h.feedback, motivo: h.motivo_reprovacao, autor: h.autor, data: h.criado_em,
    })),
  });
}

// PATCH /api/candidaturas/:id/etapa — a empresa movimenta o candidato (RF12, RN12 a RN14)
//   { acao: 'avancar' }                      vai para a próxima etapa
//   { acao: 'mover', etapaId }               vai para uma etapa específica (arrastar no quadro)
//   { acao: 'reprovar', motivo, feedback? }  encerra como Reprovado (motivo obrigatório)
//   { acao: 'contratar', feedback? }         encerra como Contratado (só na última etapa)
async function movimentar(req, res) {
  const candidaturaId = lerId(req.params.id);
  const corpo = req.body || {};
  const usuario = req.usuario;
  const acao = corpo.acao;
  const feedback = typeof corpo.feedback === 'string' ? corpo.feedback.trim().slice(0, 2000) || null : null;
  if (!['avancar', 'mover', 'reprovar', 'contratar'].includes(acao)) {
    throw invalido({ acao: 'Use avancar, mover, reprovar ou contratar.' });
  }

  const resultado = await transacao(async (db) => {
    const c = await carregar(db, candidaturaId, true);
    if (c.empresa_id !== usuario.empresaId) throw proibido('Só a empresa dona da vaga move candidatos.');
    if (FINAIS.includes(c.status)) {
      throw conflito('status_final', 'Esta candidatura já foi finalizada e não pode mais ser alterada.');      // RN14
    }

    const etapas = await db.query('SELECT id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem', [c.vaga_id]);
    const atual = etapas.find((e) => e.id === c.etapa_atual_id);
    const ultima = etapas[etapas.length - 1];
    let novoStatus = 'EM_ANDAMENTO';
    let novaEtapa = atual;
    let motivo = null;
    let aviso;

    if (acao === 'avancar') {
      novaEtapa = etapas.find((e) => e.ordem > atual.ordem);
      if (!novaEtapa) throw conflito('ultima_etapa', 'O candidato já está na última etapa. Use "contratar".');
      // registra a aprovação na etapa que ele acabou de passar
      await db.query(
        `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status, feedback)
         VALUES (?, ?, ?, 'APROVADO_ETAPA', ?)`, [c.id, atual.id, usuario.id, feedback]);
      aviso = `Você avançou para a etapa "${novaEtapa.nome}" na vaga "${c.vaga_titulo}".`;
    } else if (acao === 'mover') {
      novaEtapa = etapas.find((e) => e.id === Number(corpo.etapaId));
      if (!novaEtapa) throw invalido({ etapaId: 'Etapa não pertence a esta vaga.' });
      if (novaEtapa.id === atual.id) return { id: c.id, status: c.status, etapaId: atual.id, etapa: atual.nome };
      aviso = `Sua candidatura para "${c.vaga_titulo}" está agora na etapa "${novaEtapa.nome}".`;
    } else if (acao === 'reprovar') {
      motivo = typeof corpo.motivo === 'string' ? corpo.motivo.trim() : '';
      if (!motivo) throw invalido({ motivo: 'Escolha o motivo da reprovação.' });                               // RN13
      if (motivo.length > 120) throw invalido({ motivo: 'Motivo muito longo (máx. 120 caracteres).' });
      novoStatus = 'REPROVADO';
      aviso = `O processo seletivo da vaga "${c.vaga_titulo}" foi encerrado para você.`;
    } else {
      if (atual.id !== ultima.id) {
        throw conflito('nao_e_ultima_etapa', `Para contratar, o candidato precisa estar na última etapa ("${ultima.nome}").`);
      }
      novoStatus = 'CONTRATADO';
      aviso = `Parabéns! Você foi contratado(a) para a vaga "${c.vaga_titulo}".`;
    }

    await db.query('UPDATE candidatura SET etapa_atual_id = ?, status = ? WHERE id = ?', [novaEtapa.id, novoStatus, c.id]);
    await db.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status, feedback, motivo_reprovacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [c.id, novaEtapa.id, usuario.id, novoStatus, acao === 'avancar' ? null : feedback, motivo]);
    await notificar(db, c.candidato_usuario_id, 'Atualização da candidatura', aviso, `/vagas/${c.vaga_id}`);

    return { id: c.id, status: novoStatus, etapaId: novaEtapa.id, etapa: novaEtapa.nome };
  });

  res.json(resultado);
}

// DELETE /api/candidaturas/:id — o candidato desiste (RN15)
async function desistir(req, res) {
  const candidaturaId = lerId(req.params.id);
  const usuario = req.usuario;
  await transacao(async (db) => {
    const c = await carregar(db, candidaturaId, true);
    if (c.candidato_id !== usuario.candidatoId) throw proibido();
    if (FINAIS.includes(c.status)) throw conflito('status_final', 'Esta candidatura já foi finalizada.');
    await db.query(`UPDATE candidatura SET status = 'DESISTIU' WHERE id = ?`, [c.id]);
    await db.query(
      `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status) VALUES (?, ?, ?, 'DESISTIU')`,
      [c.id, c.etapa_atual_id, usuario.id]);
  });
  res.json({ id: candidaturaId, status: 'DESISTIU' });
}

module.exports = { candidatar, listarPorVaga, motivos, detalhar, movimentar, desistir };
