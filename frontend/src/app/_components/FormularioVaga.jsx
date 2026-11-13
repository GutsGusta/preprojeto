'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { vagasApi, habilidadesApi } from '@/app/_lib/servicos';
import { Aviso, Carregando } from '@/app/_components/Estados';
import { MODALIDADE, CONTRATO } from '@/app/_lib/formatar';

const NIVEIS = ['Estágio', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Especialista'];
const AREAS = ['Tecnologia', 'Dados', 'Design', 'Marketing', 'Vendas', 'Administrativo', 'Financeiro', 'Recursos Humanos', 'Atendimento'];
const ETAPAS_PADRAO = ['Triagem de currículo', 'Teste técnico', 'Entrevista', 'Proposta'];
const PASSOS = ['Dados da vaga', 'Requisitos', 'Etapas de seleção'];

// Em qual passo fica cada campo (para levar o usuário até o erro)
const PASSO_DO_CAMPO = {
  titulo: 0, area: 0, nivel: 0, modalidade: 0, tipoContrato: 0, cidade: 0, uf: 0, salarioMin: 0, salarioMax: 0,
  descricao: 1, habilidades: 1, etapas: 2,
};

const VAZIO = {
  titulo: '', area: '', nivel: '', modalidade: 'HIBRIDO', tipoContrato: 'CLT', cidade: '', uf: '',
  salarioMin: '', salarioMax: '', descricao: '', habilidades: [], etapas: ETAPAS_PADRAO,
};

function validarPasso(passo, v) {
  const e = {};
  if (passo === 0) {
    if (v.titulo.trim().length < 3) e.titulo = 'O título deve ter pelo menos 3 caracteres.';
    if (!v.area.trim()) e.area = 'Informe a área.';
    if (!v.nivel) e.nivel = 'Escolha o nível.';
    if (v.modalidade !== 'REMOTO' && !v.cidade.trim()) e.cidade = 'Informe a cidade (obrigatória para vagas não remotas).';
    if (v.uf && !/^[A-Za-z]{2}$/.test(v.uf)) e.uf = 'Use a sigla, ex.: SP.';
    if (v.salarioMin !== '' && v.salarioMax !== '' && Number(v.salarioMin) > Number(v.salarioMax)) {
      e.salarioMax = 'O máximo não pode ser menor que o mínimo.';
    }
  }
  if (passo === 1 && !v.descricao.trim()) e.descricao = 'Descreva a vaga, os requisitos e os benefícios.';
  if (passo === 2) {
    if (!v.etapas.some((x) => x.trim())) e.etapas = 'A vaga precisa de pelo menos uma etapa.';
    else if (v.etapas.some((x) => !x.trim())) e.etapas = 'Preencha ou remova as etapas em branco.';
  }
  return e;
}

// id vazio = nova vaga; com id = edição
export default function FormularioVaga({ id }) {
  const editando = Boolean(id);
  const router = useRouter();

  const [v, setV] = useState(editando ? null : VAZIO);
  const [status, setStatus] = useState('RASCUNHO');
  const [temCandidatos, setTemCandidatos] = useState(false);
  const [passo, setPasso] = useState(0);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);
  const titulo = useRef(null);

  useEffect(() => {
    if (!editando) return;
    vagasApi.detalhar(id).then((d) => {
      if (!d.podeGerenciar) { setErroGeral('Esta vaga não pertence à sua empresa.'); return; }
      setStatus(d.status);
      setTemCandidatos(d.totalCandidaturas > 0);
      setV({
        titulo: d.titulo, area: d.area, nivel: d.nivel, modalidade: d.modalidade, tipoContrato: d.tipoContrato,
        cidade: d.cidade || '', uf: d.uf || '', salarioMin: d.salarioMin ?? '', salarioMax: d.salarioMax ?? '',
        descricao: d.descricao, habilidades: d.habilidades, etapas: d.etapas.map((e) => e.nome),
      });
    }).catch((e) => setErroGeral(e.message));
  }, [editando, id]);

  useEffect(() => { titulo.current?.focus(); }, [passo]);

  const campo = (nome) => ({
    value: v[nome],
    onChange: (e) => {
      setV({ ...v, [nome]: e.target.value });
      if (erros[nome]) setErros(({ [nome]: _removido, ...resto }) => resto);
    },
    'aria-invalid': Boolean(erros[nome]),
    'aria-describedby': erros[nome] ? `erro-${nome}` : undefined,
  });
  const erroDe = (nome) => (erros[nome] ? <span id={`erro-${nome}`} className="erro">{erros[nome]}</span> : null);

  function avancar() {
    const e = validarPasso(passo, v);
    setErros(e);
    if (!Object.keys(e).length) setPasso(passo + 1);
  }

  async function salvar(publicar) {
    const todos = { ...validarPasso(0, v), ...validarPasso(1, v), ...validarPasso(2, v) };
    setErros(todos);
    if (Object.keys(todos).length) {
      setPasso(Math.min(...Object.keys(todos).map((k) => PASSO_DO_CAMPO[k] ?? 0)));
      return;
    }
    setSalvando(true);
    setErroGeral('');
    const dados = { ...v, uf: v.uf.toUpperCase(), etapas: v.etapas.map((x) => x.trim()), publicar };
    try {
      const r = editando ? await vagasApi.atualizar(id, dados) : await vagasApi.criar(dados);
      if (editando && publicar && status === 'RASCUNHO') await vagasApi.alterarStatus(id, 'ABERTA');
      router.replace(`/empresa/vagas?salva=${r.id}`);
    } catch (e) {
      setErroGeral(e.message);
      if (e.detalhes && Object.keys(e.detalhes).length) {
        setErros(e.detalhes);
        setPasso(Math.min(...Object.keys(e.detalhes).map((k) => PASSO_DO_CAMPO[k] ?? 0)));
      }
      setSalvando(false);
    }
  }

  if (!v) return <div className="container pagina">{erroGeral ? <Aviso>{erroGeral}</Aviso> : <Carregando />}</div>;

  const ultimo = passo === PASSOS.length - 1;

  return (
    <div className="container pagina pilha" style={{ gap: 20, maxWidth: 900 }}>
      <Link href="/empresa/vagas" className="pequeno" style={{ width: 'fit-content' }}>‹ Minhas vagas</Link>
      <h1>{editando ? 'Editar vaga' : 'Nova vaga'}</h1>

      <ol className="passos" aria-label="Passos do cadastro">
        {PASSOS.map((p, i) => (
          <li key={p} className={i === passo ? 'atual' : i < passo ? 'feito' : undefined} aria-current={i === passo ? 'step' : undefined}>
            <span className="num">{i < passo ? '✓' : i + 1}</span>
            <button type="button" className="botao-link" style={{ color: 'inherit', textDecoration: 'none' }}
              onClick={() => i < passo && setPasso(i)} disabled={i > passo}>{p}</button>
          </li>
        ))}
      </ol>

      <Aviso>{erroGeral}</Aviso>

      <form className="cartao pilha" style={{ gap: 18 }} onSubmit={(e) => { e.preventDefault(); ultimo ? salvar(!editando || status === 'RASCUNHO' ? true : false) : avancar(); }} noValidate>
        <h2 ref={titulo} tabIndex={-1}>{PASSOS[passo]}</h2>

        {passo === 0 && (
          <>
            <label className={`campo${erros.titulo ? ' com-erro' : ''}`}>Título da vaga *
              <input type="text" maxLength={150} placeholder="Ex.: Desenvolvedor(a) Front-end Júnior" {...campo('titulo')} />
              {erroDe('titulo')}
            </label>
            <div className="grade grade-3">
              <label className={`campo${erros.area ? ' com-erro' : ''}`}>Área *
                <input type="text" list="areas" {...campo('area')} />
                <datalist id="areas">{AREAS.map((a) => <option key={a} value={a} />)}</datalist>
                {erroDe('area')}
              </label>
              <label className={`campo${erros.nivel ? ' com-erro' : ''}`}>Nível *
                <select {...campo('nivel')}>
                  <option value="">Selecione</option>
                  {NIVEIS.map((n) => <option key={n}>{n}</option>)}
                </select>
                {erroDe('nivel')}
              </label>
              <label className="campo">Tipo de contrato *
                <select {...campo('tipoContrato')}>
                  {Object.entries(CONTRATO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
                </select>
              </label>
            </div>
            <fieldset>
              <legend>Modalidade *</legend>
              <div className="chips-opcao">
                {Object.entries(MODALIDADE).map(([k, r]) => (
                  <label key={k} className="chip-opcao">
                    <input type="radio" name="modalidade" value={k} checked={v.modalidade === k} onChange={(e) => setV({ ...v, modalidade: e.target.value })} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grade grade-3">
              <label className={`campo${erros.cidade ? ' com-erro' : ''}`}>Cidade {v.modalidade !== 'REMOTO' ? '*' : '(opcional)'}
                <input type="text" maxLength={80} {...campo('cidade')} />
                {erroDe('cidade')}
              </label>
              <label className={`campo${erros.uf ? ' com-erro' : ''}`}>UF
                <input type="text" maxLength={2} placeholder="SP" style={{ textTransform: 'uppercase' }} {...campo('uf')} />
                {erroDe('uf')}
              </label>
              <div />
              <label className={`campo${erros.salarioMin ? ' com-erro' : ''}`}>Salário mínimo (R$, opcional)
                <input type="number" min="0" step="100" inputMode="numeric" {...campo('salarioMin')} />
                {erroDe('salarioMin')}
              </label>
              <label className={`campo${erros.salarioMax ? ' com-erro' : ''}`}>Salário máximo (R$, opcional)
                <input type="number" min="0" step="100" inputMode="numeric" {...campo('salarioMax')} />
                {erroDe('salarioMax')}
              </label>
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <label className={`campo${erros.descricao ? ' com-erro' : ''}`}>Descrição, requisitos e benefícios *
              <textarea rows={10} placeholder={'O que a pessoa vai fazer\n\nRequisitos:\n- ...\n\nBenefícios:\n- ...'} {...campo('descricao')} />
              {erroDe('descricao')}
            </label>
            <CampoHabilidades valor={v.habilidades} aoMudar={(habilidades) => setV({ ...v, habilidades })} erro={erros.habilidades} />
          </>
        )}

        {passo === 2 && (
          <EditorEtapas etapas={v.etapas} aoMudar={(etapas) => setV({ ...v, etapas })} bloqueado={temCandidatos} erro={erros.etapas} />
        )}

        <div className="linha entre" style={{ borderTop: '1px solid var(--borda)', paddingTop: 16 }}>
          <div className="linha">
            {passo > 0 && <button type="button" className="botao neutro" onClick={() => setPasso(passo - 1)}>‹ Voltar</button>}
          </div>
          <div className="linha">
            {(!editando || status === 'RASCUNHO') && (
              <button type="button" className="botao neutro" disabled={salvando} onClick={() => salvar(false)}>Salvar rascunho</button>
            )}
            {!ultimo && <button type="submit" className="botao">Próximo: {PASSOS[passo + 1].toLowerCase()} ›</button>}
            {ultimo && (
              <button type="submit" className="botao" disabled={salvando}>
                {salvando ? 'Salvando…' : editando && status !== 'RASCUNHO' ? 'Salvar alterações' : 'Publicar vaga'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Campo de habilidades com sugestões vindas da API (as novas são cadastradas ao salvar)
function CampoHabilidades({ valor, aoMudar, erro }) {
  const [texto, setTexto] = useState('');
  const [sugestoes, setSugestoes] = useState([]);

  const termo = texto.trim();
  useEffect(() => {
    if (termo.length < 2) return undefined;
    const t = setTimeout(() => {
      habilidadesApi.buscar(termo)
        .then((lista) => setSugestoes(lista.map((h) => h.nome).filter((n) => !valor.some((x) => x.toLowerCase() === n.toLowerCase())).slice(0, 6)))
        .catch(() => setSugestoes([]));
    }, 250);
    return () => clearTimeout(t);
  }, [termo, valor]);

  function adicionar(nome) {
    const limpo = nome.trim();
    if (limpo && !valor.some((x) => x.toLowerCase() === limpo.toLowerCase()) && valor.length < 20) aoMudar([...valor, limpo]);
    setTexto('');
    setSugestoes([]);
  }

  return (
    <div className="pilha" style={{ gap: 8 }}>
      <label className={`campo${erro ? ' com-erro' : ''}`}>Habilidades desejadas (usadas no cálculo do match)
        <input type="text" value={texto} maxLength={80} placeholder="Digite e tecle Enter, ex.: React"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); adicionar(texto); } }} />
        {erro && <span className="erro">{erro}</span>}
      </label>
      {termo.length >= 2 && sugestoes.length > 0 && (
        <ul className="sugestoes" aria-label="Sugestões">
          {sugestoes.map((s) => <li key={s}><button type="button" onClick={() => adicionar(s)}>{s}</button></li>)}
        </ul>
      )}
      {valor.length > 0 && (
        <ul className="chips" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {valor.map((h) => (
            <li key={h} className="chip">{h}
              <button type="button" aria-label={`Remover ${h}`} onClick={() => aoMudar(valor.filter((x) => x !== h))}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Lista ordenada de etapas: adicionar, renomear, reordenar e remover
function EditorEtapas({ etapas, aoMudar, bloqueado, erro }) {
  const trocar = (i, j) => { const n = [...etapas]; [n[i], n[j]] = [n[j], n[i]]; aoMudar(n); };

  if (bloqueado) {
    return (
      <div className="pilha" style={{ gap: 10 }}>
        <div className="aviso info">Esta vaga já recebeu candidaturas, por isso as etapas não podem mais ser alteradas.</div>
        <ol className="etapas-lista">
          {etapas.map((e, i) => <li key={e}><span className="num">{i + 1}</span>{e}</li>)}
        </ol>
      </div>
    );
  }

  return (
    <div className="pilha" style={{ gap: 10 }}>
      <p className="texto-2 pequeno">Os candidatos passam pelas etapas nesta ordem. A última etapa é onde acontece a contratação.</p>
      {erro && <span className="erro-campo" role="alert">{erro}</span>}
      <div className="lista-etapas">
        {etapas.map((e, i) => (
          <div key={i} className="item">
            <span className="num">{i + 1}</span>
            <label className="sr-only" htmlFor={`etapa-${i}`}>Nome da etapa {i + 1}</label>
            <input id={`etapa-${i}`} className="input" value={e} maxLength={80}
              onChange={(ev) => aoMudar(etapas.map((x, k) => (k === i ? ev.target.value : x)))} />
            <button type="button" className="botao neutro icone" aria-label={`Subir etapa ${i + 1}`} disabled={i === 0} onClick={() => trocar(i, i - 1)}>↑</button>
            <button type="button" className="botao neutro icone" aria-label={`Descer etapa ${i + 1}`} disabled={i === etapas.length - 1} onClick={() => trocar(i, i + 1)}>↓</button>
            <button type="button" className="botao perigo icone" aria-label={`Remover etapa ${i + 1}`} disabled={etapas.length === 1}
              onClick={() => aoMudar(etapas.filter((_, k) => k !== i))}>×</button>
          </div>
        ))}
      </div>
      {etapas.length < 10 && (
        <button type="button" className="botao secundario" style={{ width: 'fit-content' }} onClick={() => aoMudar([...etapas, ''])}>+ Adicionar etapa</button>
      )}
    </div>
  );
}
