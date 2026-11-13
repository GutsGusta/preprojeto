'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { vagasApi, candidaturasApi } from '@/app/_lib/servicos';
import { useAuth } from '@/app/_lib/AuthContext';
import { Aviso, Carregando, EstadoVazio } from '@/app/_components/Estados';
import { LogoEmpresa, Match, StatusCandidatura, StatusVaga } from '@/app/_components/Etiquetas';
import BotaoFavorito from '@/app/_components/BotaoFavorito';
import Modal from '@/app/_components/Modal';
import { IconeVoltar } from '@/app/_components/Icones';
import { MODALIDADE, CONTRATO, faixaSalarial, local, data, haQuantoTempo } from '@/app/_lib/formatar';

const FINAIS = ['CONTRATADO', 'REPROVADO', 'DESISTIU'];

export default function DetalheVaga() {
  const { id } = useParams();
  const pathname = usePathname();
  const { usuario, ehCandidato, carregando: carregandoLogin } = useAuth();
  const [vaga, setVaga] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(() => (
    vagasApi.detalhar(id)
      .then((v) => { setVaga(v); setErro(''); })
      .catch((e) => setErro(e.status === 404 ? 'nao_encontrada' : e.message))
  ), [id]);

  useEffect(() => { if (!carregandoLogin) carregar(); }, [carregar, carregandoLogin, usuario?.id]);

  async function desistir() {
    if (!window.confirm('Deseja mesmo desistir desta candidatura? Essa ação não pode ser desfeita.')) return;
    try {
      await candidaturasApi.desistir(vaga.minhaCandidatura.id);
      setMensagem('Você desistiu da candidatura.');
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro === 'nao_encontrada') {
    return (
      <div className="container pagina">
        <EstadoVazio titulo="Vaga não encontrada">
          <p>Ela pode ter sido encerrada ou removida.</p>
          <Link href="/vagas" className="botao">Ver outras vagas</Link>
        </EstadoVazio>
      </div>
    );
  }
  if (!vaga) return <div className="container pagina">{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</div>;

  const minha = vaga.minhaCandidatura;
  const aberta = vaga.status === 'ABERTA';

  return (
    <div className="container pagina pilha" style={{ gap: 20 }}>
      <Link href="/vagas" className="linha pequeno" style={{ gap: 4, width: 'fit-content' }}><IconeVoltar />Voltar para a busca</Link>

      <section className="cartao linha entre" style={{ gap: 20, alignItems: 'flex-start' }}>
        <div className="linha" style={{ gap: 16, alignItems: 'flex-start', flex: '1 1 420px' }}>
          <LogoEmpresa empresa={vaga.empresa} grande />
          <div className="pilha" style={{ gap: 6 }}>
            <div className="linha" style={{ gap: 8 }}>
              <h1>{vaga.titulo}</h1>
              {!aberta && <StatusVaga status={vaga.status} />}
            </div>
            <p className="texto-2">{vaga.empresa.nome}</p>
            <p className="pequeno">
              {[local(vaga), MODALIDADE[vaga.modalidade], CONTRATO[vaga.tipoContrato], vaga.nivel, vaga.area].filter(Boolean).join(' · ')}
            </p>
            <p><strong>{faixaSalarial(vaga.salarioMin, vaga.salarioMax)}</strong></p>
          </div>
        </div>

        <div className="pilha" style={{ gap: 10, alignItems: 'flex-end' }}>
          <Match valor={vaga.match} />
          <div className="linha" style={{ justifyContent: 'flex-end' }}>
            {vaga.podeGerenciar && (
              <>
                {vaga.status !== 'ENCERRADA' && <Link href={`/empresa/vagas/${vaga.id}/editar`} className="botao neutro">Editar</Link>}
                <Link href={`/empresa/vagas/${vaga.id}/processo`} className="botao">Ver candidatos ({vaga.totalCandidaturas})</Link>
              </>
            )}
            {ehCandidato && <BotaoFavorito vagaId={vaga.id} favorita={vaga.favorita} comTexto />}
            {ehCandidato && !minha && aberta && (
              <button type="button" className="botao" onClick={() => setModalAberto(true)}>Candidatar-se</button>
            )}
            {!usuario && aberta && (
              <Link href={`/login?voltar=${encodeURIComponent(pathname)}`} className="botao">Entrar para se candidatar</Link>
            )}
          </div>
        </div>
      </section>

      <Aviso tipo="sucesso">{mensagem}</Aviso>
      <Aviso>{erro}</Aviso>

      {minha && (
        <div className="aviso info linha entre">
          <span>
            Você se candidatou {haQuantoTempo(minha.enviadaEm)}. Situação: <StatusCandidatura status={minha.status} />
            {!FINAIS.includes(minha.status) && <> · etapa atual: <strong>{minha.etapa}</strong></>}
          </span>
          {!FINAIS.includes(minha.status) && (
            <button type="button" className="botao perigo pequeno" onClick={desistir}>Desistir</button>
          )}
        </div>
      )}

      <div className="layout-lista">
        <main className="cartao pilha" style={{ gap: 24 }}>
          <section className="pilha" style={{ gap: 8 }}>
            <h2>Descrição da vaga</h2>
            <p className="texto-longo">{vaga.descricao}</p>
          </section>
          {vaga.habilidades.length > 0 && (
            <section className="pilha" style={{ gap: 8 }}>
              <h2>Habilidades desejadas</h2>
              <ul className="chips" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {vaga.habilidades.map((h) => <li key={h} className="tag">{h}</li>)}
              </ul>
            </section>
          )}
        </main>

        <aside className="pilha" style={{ position: 'static' }}>
          <section className="cartao pilha" style={{ gap: 12 }}>
            <h2>Etapas do processo</h2>
            <ol className="etapas-lista">
              {vaga.etapas.map((e) => (
                <li key={e.id} className={minha && !FINAIS.includes(minha.status) && minha.etapa === e.nome ? 'atual' : undefined}>
                  <span className="num">{e.ordem}</span>{e.nome}
                </li>
              ))}
            </ol>
          </section>
          <section className="cartao pilha" style={{ gap: 8 }}>
            <h2>Sobre a empresa</h2>
            <p><strong>{vaga.empresa.nome}</strong>{vaga.empresa.setor && <span className="texto-2"> · {vaga.empresa.setor}</span>}</p>
            {vaga.empresa.descricao && <p className="texto-2 pequeno">{vaga.empresa.descricao}</p>}
          </section>
          <p className="texto-2 pequeno">
            {vaga.publicadaEm ? `Publicada em ${data(vaga.publicadaEm)}` : 'Ainda não publicada'} · {vaga.totalCandidaturas} candidaturas
          </p>
        </aside>
      </div>

      {modalAberto && (
        <ModalCandidatura
          vaga={vaga}
          aoFechar={() => setModalAberto(false)}
          aoEnviar={() => { setModalAberto(false); setMensagem('Candidatura enviada! Acompanhe o andamento por aqui.'); carregar(); }}
        />
      )}
    </div>
  );
}

function ModalCandidatura({ vaga, aoFechar, aoEnviar }) {
  const [carta, setCarta] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro('');
    setEnviando(true);
    try {
      await vagasApi.candidatar(vaga.id, carta);
      aoEnviar();
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo="Candidatar-se"
      subtitulo={`${vaga.titulo} · ${vaga.empresa.nome}`}
      aoFechar={aoFechar}
      rodape={
        <>
          <button type="button" className="botao neutro" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="botao" onClick={enviar} disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar candidatura'}</button>
        </>
      }
    >
      <p className="texto-2">Uma cópia do seu currículo atual será enviada para a empresa.</p>
      <Aviso>{erro}</Aviso>
      <label className="campo">Carta de apresentação (opcional)
        <textarea maxLength={3000} value={carta} onChange={(e) => setCarta(e.target.value)}
          placeholder="Conte por que você tem interesse nesta vaga." />
        <span className="texto-2" style={{ fontWeight: 400 }}>{carta.length}/3000</span>
      </label>
    </Modal>
  );
}
