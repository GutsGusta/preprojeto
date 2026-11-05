'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RotaProtegida from '@/app/_components/RotaProtegida';
import { vagasApi, candidaturasApi } from '@/app/_lib/servicos';
import { Aviso, Carregando } from '@/app/_components/Estados';
import { Match, StatusCandidatura, StatusVaga } from '@/app/_components/Etiquetas';
import Modal from '@/app/_components/Modal';
import { data, haQuantoTempo, iniciais, STATUS_CANDIDATURA } from '@/app/_lib/formatar';

// Quadro do processo seletivo (Kanban): uma coluna por etapa.
// Arraste um card para mudar a etapa, ou clique nele para ver o currículo e decidir.
export default function PaginaProcesso() {
  return <RotaProtegida perfis={['RECRUTADOR']}><ProcessoVaga /></RotaProtegida>;
}

function ProcessoVaga() {
  const { id } = useParams();
  const [quadro, setQuadro] = useState(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [aberta, setAberta] = useState(null);        // candidatura aberta no modal
  const [arrastando, setArrastando] = useState(null);
  const [alvo, setAlvo] = useState(null);

  const carregar = useCallback(() => vagasApi.candidaturas(id).then(setQuadro).catch((e) => setErro(e.message)), [id]);
  useEffect(() => { carregar(); }, [carregar]);

  async function mover(candidatura, etapa) {
    if (candidatura.etapaId === etapa.id) return;
    setErro('');
    try {
      await candidaturasApi.movimentar(candidatura.id, { acao: 'mover', etapaId: etapa.id });
      setAviso(`${candidatura.candidato.nome} foi para "${etapa.nome}".`);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!quadro) return <div className="container pagina">{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</div>;

  const finalizadas = Object.entries(quadro.finalizadas).flatMap(([status, lista]) => lista.map((c) => ({ ...c, status })));
  const vagaFechada = quadro.vaga.status === 'ENCERRADA';

  return (
    <div className="container pagina pilha" style={{ gap: 20, maxWidth: 1400 }}>
      <Link href="/empresa/vagas" className="pequeno" style={{ width: 'fit-content' }}>‹ Minhas vagas</Link>
      <div className="linha entre">
        <div className="pilha" style={{ gap: 4 }}>
          <div className="linha" style={{ gap: 8 }}>
            <h1>{quadro.vaga.titulo}</h1>
            <StatusVaga status={quadro.vaga.status} />
          </div>
          <p className="texto-2">{quadro.total} candidaturas · arraste os cards entre as etapas ou clique para abrir</p>
        </div>
        <Link href={`/vagas/${id}`} className="botao neutro">Ver página da vaga</Link>
      </div>

      <Aviso tipo="sucesso">{aviso}</Aviso>
      <Aviso>{erro}</Aviso>
      {vagaFechada && <Aviso tipo="info">Esta vaga foi encerrada. As candidaturas abaixo estão só para consulta.</Aviso>}

      <div className="quadro">
        {quadro.etapas.map((etapa, i) => (
          <section
            key={etapa.id}
            className={`coluna${alvo === etapa.id ? ' alvo' : ''}`}
            aria-labelledby={`etapa-${etapa.id}`}
            onDragOver={(e) => { if (arrastando) { e.preventDefault(); setAlvo(etapa.id); } }}
            onDragLeave={() => setAlvo(null)}
            onDrop={(e) => { e.preventDefault(); setAlvo(null); if (arrastando) mover(arrastando, etapa); setArrastando(null); }}
          >
            <h2 id={`etapa-${etapa.id}`}>
              <span>{i + 1}. {etapa.nome}</span>
              <span className="contagem">{etapa.candidaturas.length}</span>
            </h2>
            {etapa.candidaturas.length === 0 && <p className="vazio-coluna">Nenhum candidato nesta etapa</p>}
            {etapa.candidaturas.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`card-candidato${arrastando?.id === c.id ? ' arrastando' : ''}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setArrastando(c); }}
                onDragEnd={() => { setArrastando(null); setAlvo(null); }}
                onClick={() => setAberta(c.id)}
              >
                <span className="linha entre" style={{ width: '100%', flexWrap: 'nowrap' }}>
                  <span className="linha" style={{ gap: 8, flexWrap: 'nowrap' }}>
                    <span className="avatar" aria-hidden="true">{iniciais(c.candidato.nome)}</span>
                    <strong>{c.candidato.nome}</strong>
                  </span>
                  <Match valor={c.match} />
                </span>
                <span className="texto-2 pequeno">
                  {[c.candidato.cidade, c.candidato.uf].filter(Boolean).join(', ') || 'Local não informado'} · candidatou-se {haQuantoTempo(c.enviadaEm)}
                </span>
              </button>
            ))}
          </section>
        ))}
      </div>

      <section className="cartao pilha" style={{ gap: 12 }}>
        <div className="linha">
          <h2>Finalizadas</h2>
          {Object.entries(quadro.finalizadas).map(([s, l]) => (
            <span key={s} className={`status ${s}`}>{STATUS_CANDIDATURA[s]}: {l.length}</span>
          ))}
        </div>
        {finalizadas.length === 0
          ? <p className="texto-2 pequeno">Nenhuma candidatura finalizada ainda.</p>
          : (
            <ul className="pilha" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
              {finalizadas.map((c) => (
                <li key={c.id} className="linha entre">
                  <button type="button" className="botao-link" onClick={() => setAberta(c.id)}>{c.candidato.nome}</button>
                  <span className="linha"><StatusCandidatura status={c.status} /><span className="texto-2 pequeno">{data(c.atualizadaEm)}</span></span>
                </li>
              ))}
            </ul>
          )}
      </section>

      {aberta && (
        <ModalCandidatura
          id={aberta}
          aoFechar={() => setAberta(null)}
          aoMudar={(msg) => { setAberta(null); setAviso(msg); carregar(); }}
        />
      )}
    </div>
  );
}

const FINAIS = ['CONTRATADO', 'REPROVADO', 'DESISTIU'];

// Currículo enviado, linha do tempo e decisões (avançar, mover, reprovar, contratar)
function ModalCandidatura({ id, aoFechar, aoMudar }) {
  const [c, setC] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [modo, setModo] = useState(null);          // null | 'reprovar'
  const [motivo, setMotivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    candidaturasApi.detalhar(id).then(setC).catch((e) => setErro(e.message));
    candidaturasApi.motivos().then(setMotivos).catch(() => {});
  }, [id]);

  async function agir(dados, mensagem) {
    setErro('');
    setEnviando(true);
    try {
      await candidaturasApi.movimentar(id, { ...dados, feedback });
      aoMudar(mensagem);
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  if (!c) {
    return <Modal titulo="Candidatura" aoFechar={aoFechar}>{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</Modal>;
  }

  const cv = c.curriculo || {};
  const atual = c.etapas.find((e) => e.id === c.etapaAtualId);
  const proxima = c.etapas.find((e) => e.ordem === (atual?.ordem ?? 0) + 1);
  const finalizada = FINAIS.includes(c.status) || c.vaga.status === 'ENCERRADA';

  const rodape = finalizada ? (
    <button type="button" className="botao neutro" onClick={aoFechar}>Fechar</button>
  ) : modo === 'reprovar' ? (
    <>
      <button type="button" className="botao neutro" onClick={() => setModo(null)}>Cancelar</button>
      <button type="button" className="botao perigo" disabled={!motivo || enviando}
        onClick={() => agir({ acao: 'reprovar', motivo }, `${cv.nome} foi reprovado(a).`)}>Confirmar reprovação</button>
    </>
  ) : (
    <>
      <button type="button" className="botao perigo" onClick={() => setModo('reprovar')}>Reprovar</button>
      {proxima ? (
        <button type="button" className="botao sucesso" disabled={enviando}
          onClick={() => agir({ acao: 'avancar' }, `${cv.nome} avançou para "${proxima.nome}".`)}>
          Aprovar e avançar para {proxima.nome}
        </button>
      ) : (
        <button type="button" className="botao sucesso" disabled={enviando}
          onClick={() => agir({ acao: 'contratar' }, `${cv.nome} foi contratado(a)!`)}>Contratar</button>
      )}
    </>
  );

  return (
    <Modal titulo={cv.nome} subtitulo={`${c.vaga.titulo} · enviada em ${data(c.enviadaEm)}`} aoFechar={aoFechar} rodape={rodape}>
      <div className="linha">
        <StatusCandidatura status={c.status} />
        {!FINAIS.includes(c.status) && <span className="pequeno">Etapa atual: <strong>{atual?.nome}</strong></span>}
      </div>
      <Aviso>{erro}</Aviso>

      {!finalizada && (
        <div className="pilha" style={{ gap: 12 }}>
          {modo === 'reprovar' && (
            <label className="campo">Motivo da reprovação *
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                <option value="">Selecione um motivo</option>
                {motivos.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
          )}
          <label className="campo">Feedback para o candidato (opcional)
            <textarea rows={3} maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </label>
          {modo !== 'reprovar' && c.etapas.length > 2 && (
            <label className="campo" style={{ maxWidth: 320 }}>Ou mover direto para a etapa
              <select value="" onChange={(e) => {
                const etapa = c.etapas.find((x) => x.id === Number(e.target.value));
                if (etapa) agir({ acao: 'mover', etapaId: etapa.id }, `${cv.nome} foi para "${etapa.nome}".`);
              }}>
                <option value="">Escolha…</option>
                {c.etapas.filter((e) => e.id !== c.etapaAtualId).map((e) => <option key={e.id} value={e.id}>{e.ordem}. {e.nome}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      <section className="pilha" style={{ gap: 6 }}>
        <h3>Contato</h3>
        <p className="pequeno">{[cv.email, cv.telefone, [cv.cidade, cv.uf].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || '—'}</p>
        {cv.pretensaoSalarial != null && <p className="pequeno">Pretensão salarial: R$ {cv.pretensaoSalarial.toLocaleString('pt-BR')}</p>}
      </section>
      {cv.resumo && <section className="pilha" style={{ gap: 6 }}><h3>Resumo</h3><p className="pequeno">{cv.resumo}</p></section>}
      {cv.habilidades?.length > 0 && (
        <section className="pilha" style={{ gap: 6 }}>
          <h3>Habilidades</h3>
          <ul className="chips" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cv.habilidades.map((h) => <li key={h.nome} className="tag">{h.nome}</li>)}
          </ul>
        </section>
      )}
      {cv.experiencias?.length > 0 && (
        <section className="pilha" style={{ gap: 6 }}>
          <h3>Experiência</h3>
          {cv.experiencias.map((x, i) => (
            <p key={i} className="pequeno"><strong>{x.cargo}</strong> · {x.empresa} · {data(x.inicio)} – {x.atual ? 'atual' : data(x.fim)}</p>
          ))}
        </section>
      )}
      {cv.formacoes?.length > 0 && (
        <section className="pilha" style={{ gap: 6 }}>
          <h3>Formação</h3>
          {cv.formacoes.map((f, i) => <p key={i} className="pequeno"><strong>{f.curso}</strong> · {f.instituicao} · {f.nivel}</p>)}
        </section>
      )}
      {c.cartaApresentacao && (
        <section className="pilha" style={{ gap: 6 }}><h3>Carta de apresentação</h3><p className="pequeno texto-longo">{c.cartaApresentacao}</p></section>
      )}

      <section className="pilha" style={{ gap: 8 }}>
        <h3>Histórico</h3>
        <ol className="linha-tempo">
          {c.historico.map((h) => (
            <li key={h.id}>
              <strong>{h.etapa}</strong> · {STATUS_CANDIDATURA[h.status]}
              <div className="texto-2 pequeno">{data(h.data)}{h.autor ? ` · por ${h.autor}` : ''}</div>
              {h.motivo && <div className="pequeno">Motivo: {h.motivo}</div>}
              {h.feedback && <div className="pequeno">“{h.feedback}”</div>}
            </li>
          ))}
        </ol>
      </section>
    </Modal>
  );
}
