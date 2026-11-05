const { query, transacao } = require('../config/db');
const { naoEncontrado, proibido, conflito, invalido, lerId } = require('../middlewares/erros');

const MODALIDADES = ['PRESENCIAL', 'HIBRIDO', 'REMOTO'];
const CONTRATOS = ['CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'FREELANCER'];


const TRANSICOES = {
  RASCUNHO: ['ABERTA'],
  ABERTA: ['PAUSADA', 'ENCERRADA'],
  PAUSADA: ['ABERTA', 'ENCERRADA'],
  ENCERRADA: [],
};



const ehCandidato = (u) => u && u.perfil === 'CANDIDATO' && u.candidatoId;
const ehRecrutador = (u) => u && u.perfil === 'RECRUTADOR' && u.empresaId;


const normalizar = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

function calcularMatch(perfil, vaga) {
  if (!perfil) return null;
  const exigidas = vaga.habilidades || [];
  const H = exigidas.length === 0 ? 1 : exigidas.filter((h) => perfil.habilidades.has(h)).length / exigidas.length;

  let L = 0;
  if (vaga.modalidade === 'REMOTO') L = 1;
  else if (vaga.cidade && normalizar(vaga.cidade) === normalizar(perfil.cidade)) L = 1;
  else if (vaga.uf && vaga.uf === perfil.uf) L = 0.5;

  let S = 1;
  const max = vaga.salario_max;
  if (perfil.pretensao != null && max != null && perfil.pretensao > max) {
    S = Math.max(0, 1 - (perfil.pretensao - max) / max);
  }
  return Math.round(((0.5 * H + 0.15 * L + 0.15 * S) / 0.8) * 100);
}

// Cidade, estado, pretensão e habilidades de cada candidato (para o match)
async function carregarPerfis(candidatoIds) {
  const perfis = new Map();
  if (!candidatoIds.length) return perfis;
  const linhas = await query(
    `SELECT c.id, c.cidade, c.uf, cu.pretensao_salarial
       FROM candidato c LEFT JOIN curriculo cu ON cu.candidato_id = c.id
      WHERE c.id IN (?)`, [candidatoIds]);
  for (const l of linhas) perfis.set(l.id, { cidade: l.cidade, uf: l.uf, pretensao: l.pretensao_salarial, habilidades: new Set() });
  const habilidades = await query(
    `SELECT cu.candidato_id, h.nome
       FROM curriculo cu
       JOIN curriculo_habilidade ch ON ch.curriculo_id = cu.id
       JOIN habilidade h ON h.id = ch.habilidade_id
      WHERE cu.candidato_id IN (?)`, [candidatoIds]);
  for (const h of habilidades) perfis.get(h.candidato_id)?.habilidades.add(h.nome);
  return perfis;
}

// Acrescenta a lista de habilidades (nomes) em cada vaga
async function anexarHabilidades(vagas) {
  if (!vagas.length) return vagas;
  const linhas = await query(
    `SELECT vh.vaga_id, h.nome FROM vaga_habilidade vh JOIN habilidade h ON h.id = vh.habilidade_id
      WHERE vh.vaga_id IN (?) ORDER BY h.nome`, [vagas.map((v) => v.id)]);
  for (const v of vagas) v.habilidades = linhas.filter((l) => l.vaga_id === v.id).map((l) => l.nome);
  return vagas;
}

// Formato da vaga nas respostas
function formatarResumo(v) {
  return {
    id: v.id,
    titulo: v.titulo,
    area: v.area,
    nivel: v.nivel,
    modalidade: v.modalidade,
    tipoContrato: v.tipo_contrato,
    cidade: v.cidade,
    uf: v.uf,
    salarioMin: v.salario_min,
    salarioMax: v.salario_max,
    status: v.status,
    publicadaEm: v.publicada_em,
    habilidades: v.habilidades || [],
    empresa: { id: v.empresa_id, nome: v.empresa_nome, logoUrl: v.empresa_logo },
  };
}

// Busca a vaga e confere se ela é da empresa do recrutador logado
async function vagaDaEmpresa(db, vagaId, usuario, travar = false) {
  const [vaga] = await db.query(`SELECT * FROM vaga WHERE id = ? ${travar ? 'FOR UPDATE' : ''}`, [vagaId]);
  if (!vaga) throw naoEncontrado('Vaga não encontrada.');
  if (!ehRecrutador(usuario) || vaga.empresa_id !== usuario.empresaId) {
    throw proibido('Só a empresa dona da vaga pode fazer isso.');
  }
  return vaga;
}

// Cadastra as habilidades que ainda não existem e liga todas à vaga
async function salvarHabilidades(db, vagaId, nomes) {
  await db.query('DELETE FROM vaga_habilidade WHERE vaga_id = ?', [vagaId]);
  for (const nome of nomes) {
    const [existente] = await db.query('SELECT id FROM habilidade WHERE nome = ?', [nome]);
    const habilidadeId = existente ? existente.id : (await db.query('INSERT INTO habilidade (nome) VALUES (?)', [nome])).insertId;
    await db.query('INSERT IGNORE INTO vaga_habilidade (vaga_id, habilidade_id) VALUES (?, ?)', [vagaId, habilidadeId]);
  }
}

async function salvarEtapas(db, vagaId, etapas) {
  await db.query('DELETE FROM etapa_vaga WHERE vaga_id = ?', [vagaId]);
  for (const [i, nome] of etapas.entries()) {
    await db.query('INSERT INTO etapa_vaga (vaga_id, nome, ordem) VALUES (?, ?, ?)', [vagaId, nome, i + 1]);
  }
}

// Valida e limpa os dados do formulário de vaga 
function validarVaga(corpo = {}) {
  const texto = (v) => (typeof v === 'string' ? v.trim() : '');
  const numero = (v) => (v === '' || v == null ? null : Number(v));
  const erros = {};
  const v = {
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

  if (v.titulo.length < 3 || v.titulo.length > 150) erros.titulo = 'O título deve ter entre 3 e 150 caracteres.';
  if (!v.descricao) erros.descricao = 'Descreva a vaga.';
  if (!v.area) erros.area = 'Informe a área.';
  if (!v.nivel) erros.nivel = 'Informe o nível.';
  if (!MODALIDADES.includes(v.modalidade)) erros.modalidade = 'Escolha presencial, híbrido ou remoto.';
  if (!CONTRATOS.includes(v.tipoContrato)) erros.tipoContrato = 'Escolha um tipo de contrato válido.';
  if (v.modalidade !== 'REMOTO' && !v.cidade) erros.cidade = 'Informe a cidade (obrigatória para vagas não remotas).';
  if (v.uf && !/^[A-Z]{2}$/.test(v.uf)) erros.uf = 'Use a sigla do estado, ex.: SP.';
  for (const campo of ['salarioMin', 'salarioMax']) {
    if (v[campo] != null && (!Number.isFinite(v[campo]) || v[campo] < 0)) erros[campo] = 'Informe um valor positivo.';
  }
  if (v.salarioMin != null && v.salarioMax != null && v.salarioMin > v.salarioMax) {
    erros.salarioMax = 'O salário máximo não pode ser menor que o mínimo.';
  }
  if (v.etapas.length === 0) erros.etapas = 'A vaga precisa de pelo menos uma etapa de seleção.';
  if (v.etapas.length > 10) erros.etapas = 'Use no máximo 10 etapas.';
  if (v.etapas.some((e) => e.length > 80)) erros.etapas = 'Cada etapa pode ter até 80 caracteres.';
  if (v.habilidades.length > 20) erros.habilidades = 'Use no máximo 20 habilidades.';
  if (v.habilidades.some((h) => h.length > 80)) erros.habilidades = 'Cada habilidade pode ter até 80 caracteres.';

  if (Object.keys(erros).length) throw invalido(erros);
  return v;
}


function lerLista(valor, permitidos) {
  if (!valor) return [];
  return String(valor).toUpperCase().split(',').map((s) => s.trim()).filter((s) => permitidos.includes(s));
}


async function listar(req, res) {
  const f = req.query;
  const pagina = Math.max(1, parseInt(f.page, 10) || 1);
  const tamanho = Math.min(50, Math.max(1, parseInt(f.size, 10) || 20));

  const onde = [`v.status = 'ABERTA'`];
  const params = [];
  if (typeof f.q === 'string' && f.q.trim()) {
    const termo = `%${f.q.trim()}%`;
    onde.push('(v.titulo LIKE ? OR v.descricao LIKE ? OR e.nome_fantasia LIKE ?)');
    params.push(termo, termo, termo);
  }
  if (typeof f.cidade === 'string' && f.cidade.trim()) { onde.push('v.cidade = ?'); params.push(f.cidade.trim()); }
  const modalidades = lerLista(f.modalidade, MODALIDADES);
  if (modalidades.length) { onde.push('v.modalidade IN (?)'); params.push(modalidades); }
  const contratos = lerLista(f.contrato, CONTRATOS);
  if (contratos.length) { onde.push('v.tipo_contrato IN (?)'); params.push(contratos); }
  if (typeof f.nivel === 'string' && f.nivel.trim()) { onde.push('v.nivel = ?'); params.push(f.nivel.trim()); }
  if (typeof f.area === 'string' && f.area.trim()) { onde.push('v.area = ?'); params.push(f.area.trim()); }
  const salarioMin = Number(f.salarioMin);
  if (salarioMin > 0) { onde.push('(v.salario_max IS NULL OR v.salario_max >= ?)'); params.push(salarioMin); }

  const ordem = f.ordem === 'salario'
    ? 'v.salario_max IS NULL, v.salario_max DESC, v.publicada_em DESC'
    : 'v.publicada_em DESC, v.id DESC';
  const base = `FROM vaga v JOIN empresa e ON e.id = v.empresa_id WHERE ${onde.join(' AND ')}`;

  const [{ total }] = await query(`SELECT COUNT(*) AS total ${base}`, params);
  const linhas = await anexarHabilidades(await query(
    `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo ${base}
      ORDER BY ${ordem} LIMIT ? OFFSET ?`,
    [...params, tamanho, (pagina - 1) * tamanho]));

  let itens = linhas.map(formatarResumo);

  // Candidato logado: acrescenta o match e se a vaga está nos favoritos
  if (ehCandidato(req.usuario) && itens.length) {
    const perfil = (await carregarPerfis([req.usuario.candidatoId])).get(req.usuario.candidatoId);
    const favoritas = new Set((await query(
      `SELECT referencia_id FROM favorito WHERE usuario_id = ? AND tipo = 'VAGA' AND referencia_id IN (?)`,
      [req.usuario.id, itens.map((i) => i.id)])).map((l) => l.referencia_id));
    itens = itens.map((item, i) => ({ ...item, match: calcularMatch(perfil, linhas[i]), favorita: favoritas.has(item.id) }));
  }

  res.json({ itens, pagina, tamanho, total, totalPaginas: Math.max(1, Math.ceil(total / tamanho)) });
}

// GET /api/vagas/filtros — opções para montar os filtros da tela
async function filtros(req, res) {
  const distintos = async (coluna) =>
    (await query(`SELECT DISTINCT ${coluna} AS valor FROM vaga
                   WHERE status = 'ABERTA' AND ${coluna} IS NOT NULL ORDER BY 1`)).map((l) => l.valor);
  res.json({
    cidades: await distintos('cidade'),
    areas: await distintos('area'),
    niveis: await distintos('nivel'),
    modalidades: MODALIDADES,
    contratos: CONTRATOS,
  });
}

// GET /api/vagas/:id — detalhe. Vaga que não está aberta só aparece para a empresa dona.
async function detalhar(req, res) {
  const vagaId = lerId(req.params.id);
  const usuario = req.usuario;
  const [v] = await query(
    `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo, e.descricao AS empresa_descricao,
            e.setor AS empresa_setor, e.cidade AS empresa_cidade, e.uf AS empresa_uf,
            (SELECT COUNT(*) FROM candidatura c WHERE c.vaga_id = v.id) AS total_candidaturas
       FROM vaga v JOIN empresa e ON e.id = v.empresa_id
      WHERE v.id = ?`, [vagaId]);
  const dona = Boolean(v && ehRecrutador(usuario) && v.empresa_id === usuario.empresaId);
  if (!v || (v.status !== 'ABERTA' && !dona && usuario?.perfil !== 'ADMIN')) throw naoEncontrado('Vaga não encontrada.');

  await anexarHabilidades([v]);
  const etapas = await query('SELECT id, nome, ordem FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem', [vagaId]);

  const vaga = {
    ...formatarResumo(v),
    descricao: v.descricao,
    encerradaEm: v.encerrada_em,
    totalCandidaturas: v.total_candidaturas,
    etapas,
    empresa: {
      id: v.empresa_id, nome: v.empresa_nome, logoUrl: v.empresa_logo, descricao: v.empresa_descricao,
      setor: v.empresa_setor, cidade: v.empresa_cidade, uf: v.empresa_uf,
    },
    podeGerenciar: dona,
  };

  
  if (usuario) await query('INSERT INTO visualizacao_vaga (usuario_id, vaga_id) VALUES (?, ?)', [usuario.id, vagaId]);

  if (ehCandidato(usuario)) {
    const perfil = (await carregarPerfis([usuario.candidatoId])).get(usuario.candidatoId);
    vaga.match = calcularMatch(perfil, v);
    vaga.favorita = (await query(
      `SELECT 1 FROM favorito WHERE usuario_id = ? AND tipo = 'VAGA' AND referencia_id = ?`, [usuario.id, vagaId])).length > 0;
    const [minha] = await query(
      `SELECT c.id, c.status, c.criado_em, e.nome AS etapa
         FROM candidatura c JOIN etapa_vaga e ON e.id = c.etapa_atual_id
        WHERE c.candidato_id = ? AND c.vaga_id = ?`, [usuario.candidatoId, vagaId]);
    vaga.minhaCandidatura = minha ? { id: minha.id, status: minha.status, etapa: minha.etapa, enviadaEm: minha.criado_em } : null;
  }

  res.json(vaga);
}


async function minhas(req, res) {
  const params = [req.usuario.empresaId];
  const onde = ['v.empresa_id = ?'];
  if (req.query.status) { onde.push('v.status = ?'); params.push(String(req.query.status).toUpperCase()); }

  const linhas = await anexarHabilidades(await query(
    `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo,
            COUNT(c.id) AS total_candidaturas,
            COALESCE(SUM(c.status IN ('EM_ANDAMENTO', 'APROVADO_ETAPA')), 0) AS em_andamento,
            COALESCE(SUM(c.status = 'CONTRATADO'), 0) AS contratados
       FROM vaga v
       JOIN empresa e ON e.id = v.empresa_id
       LEFT JOIN candidatura c ON c.vaga_id = v.id
      WHERE ${onde.join(' AND ')}
      GROUP BY v.id
      ORDER BY FIELD(v.status, 'ABERTA', 'PAUSADA', 'RASCUNHO', 'ENCERRADA'), v.criado_em DESC`, params));

  res.json(linhas.map((v) => ({
    ...formatarResumo(v),
    criadaEm: v.criado_em,
    totalCandidaturas: Number(v.total_candidaturas),
    emAndamento: Number(v.em_andamento),
    contratados: Number(v.contratados),
  })));
}

// POST /api/vagas — cria a vaga com etapas e habilidades. { publicar: true } já abre a vaga.
async function criar(req, res) {
  const dados = validarVaga(req.body);
  const status = req.body.publicar === true ? 'ABERTA' : 'RASCUNHO';
  const usuario = req.usuario;

  const id = await transacao(async (db) => {
    const r = await db.query(
      `INSERT INTO vaga (empresa_id, recrutador_id, titulo, descricao, area, nivel, modalidade, tipo_contrato,
                         cidade, uf, salario_min, salario_max, status, publicada_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === 'ABERTA' ? 'NOW()' : 'NULL'})`,
      [usuario.empresaId, usuario.recrutadorId, dados.titulo, dados.descricao, dados.area, dados.nivel,
        dados.modalidade, dados.tipoContrato, dados.cidade, dados.uf, dados.salarioMin, dados.salarioMax, status]);
    await salvarEtapas(db, r.insertId, dados.etapas);
    await salvarHabilidades(db, r.insertId, dados.habilidades);
    return r.insertId;
  });

  res.status(201).json({ id, status });
}


async function atualizar(req, res) {
  const vagaId = lerId(req.params.id);
  const dados = validarVaga(req.body);

  await transacao(async (db) => {
    const vaga = await vagaDaEmpresa(db, vagaId, req.usuario, true);
    if (vaga.status === 'ENCERRADA') {
      throw conflito('vaga_encerrada', 'Vaga encerrada não pode ser editada. Duplique-a para reaproveitar.');
    }
    await db.query(
      `UPDATE vaga SET titulo = ?, descricao = ?, area = ?, nivel = ?, modalidade = ?, tipo_contrato = ?,
                       cidade = ?, uf = ?, salario_min = ?, salario_max = ?
        WHERE id = ?`,
      [dados.titulo, dados.descricao, dados.area, dados.nivel, dados.modalidade, dados.tipoContrato,
        dados.cidade, dados.uf, dados.salarioMin, dados.salarioMax, vagaId]);

    const atuais = (await db.query('SELECT nome FROM etapa_vaga WHERE vaga_id = ? ORDER BY ordem', [vagaId])).map((l) => l.nome);
    if (JSON.stringify(atuais) !== JSON.stringify(dados.etapas)) {
      const [{ n }] = await db.query('SELECT COUNT(*) AS n FROM candidatura WHERE vaga_id = ?', [vagaId]);
      if (n > 0) throw conflito('etapas_bloqueadas', 'As etapas não podem mudar depois que a vaga recebeu candidaturas.');
      await salvarEtapas(db, vagaId, dados.etapas);
    }
    await salvarHabilidades(db, vagaId, dados.habilidades);
  });

  res.json({ id: vagaId });
}


async function alterarStatus(req, res) {
  const vagaId = lerId(req.params.id);
  const novo = String(req.body?.status || '').toUpperCase();
  const usuario = req.usuario;

  const encerradas = await transacao(async (db) => {
    const vaga = await vagaDaEmpresa(db, vagaId, usuario, true);
    if (!TRANSICOES[vaga.status].includes(novo)) {
      throw conflito('transicao_invalida', `Não é possível mudar de ${vaga.status} para ${novo || '(vazio)'}.`);
    }
    await db.query(
      `UPDATE vaga SET status = ?,
              publicada_em = IF(? = 'ABERTA' AND publicada_em IS NULL, NOW(), publicada_em),
              encerrada_em = IF(? = 'ENCERRADA', NOW(), encerrada_em)
        WHERE id = ?`, [novo, novo, novo, vagaId]);

    if (novo !== 'ENCERRADA') return 0;

    
    const ativas = await db.query(
      `SELECT c.id, c.etapa_atual_id, ca.usuario_id
         FROM candidatura c JOIN candidato ca ON ca.id = c.candidato_id
        WHERE c.vaga_id = ? AND c.status IN ('EM_ANDAMENTO', 'APROVADO_ETAPA') FOR UPDATE`, [vagaId]);
    for (const c of ativas) {
      await db.query(`UPDATE candidatura SET status = 'REPROVADO' WHERE id = ?`, [c.id]);
      await db.query(
        `INSERT INTO historico_candidatura (candidatura_id, etapa_id, autor_usuario_id, status, motivo_reprovacao)
         VALUES (?, ?, ?, 'REPROVADO', 'Vaga encerrada')`, [c.id, c.etapa_atual_id, usuario.id]);
      await db.query(
        'INSERT INTO notificacao (usuario_id, titulo, mensagem, link) VALUES (?, ?, ?, ?)',
        [c.usuario_id, 'Processo encerrado', `A vaga "${vaga.titulo}" foi encerrada.`, `/vagas/${vagaId}`]);
    }
    return ativas.length;
  });

  res.json({ id: vagaId, status: novo, candidaturasEncerradas: encerradas });
}


async function duplicar(req, res) {
  const vagaId = lerId(req.params.id);
  const novaId = await transacao(async (db) => {
    await vagaDaEmpresa(db, vagaId, req.usuario);
    const r = await db.query(
      `INSERT INTO vaga (empresa_id, recrutador_id, titulo, descricao, area, nivel, modalidade, tipo_contrato,
                         cidade, uf, salario_min, salario_max, status)
       SELECT empresa_id, ?, LEFT(CONCAT(titulo, ' (cópia)'), 150), descricao, area, nivel, modalidade, tipo_contrato,
              cidade, uf, salario_min, salario_max, 'RASCUNHO'
         FROM vaga WHERE id = ?`, [req.usuario.recrutadorId, vagaId]);
    await db.query(`INSERT INTO etapa_vaga (vaga_id, nome, ordem, descricao)
                    SELECT ?, nome, ordem, descricao FROM etapa_vaga WHERE vaga_id = ?`, [r.insertId, vagaId]);
    await db.query(`INSERT INTO vaga_habilidade (vaga_id, habilidade_id)
                    SELECT ?, habilidade_id FROM vaga_habilidade WHERE vaga_id = ?`, [r.insertId, vagaId]);
    return r.insertId;
  });
  res.status(201).json({ id: novaId, status: 'RASCUNHO' });
}


async function excluir(req, res) {
  const vagaId = lerId(req.params.id);
  await transacao(async (db) => {
    const vaga = await vagaDaEmpresa(db, vagaId, req.usuario, true);
    if (vaga.status !== 'RASCUNHO') {
      throw conflito('nao_e_rascunho', 'Só é possível excluir rascunhos. Para tirar a vaga do ar, encerre-a.');
    }
    await db.query('DELETE FROM vaga WHERE id = ?', [vagaId]);
  });
  res.status(204).end();
}

module.exports = {
  listar, filtros, detalhar, minhas, criar, atualizar, alterarStatus, duplicar, excluir,
  
  calcularMatch, carregarPerfis, anexarHabilidades,
};
