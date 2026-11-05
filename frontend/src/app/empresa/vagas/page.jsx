'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import RotaProtegida from '@/app/_components/RotaProtegida';
import { vagasApi } from '@/app/_lib/servicos';
import { Aviso, Carregando, EstadoVazio } from '@/app/_components/Estados';
import { StatusVaga } from '@/app/_components/Etiquetas';
import { MODALIDADE, CONTRATO, STATUS_VAGA, data } from '@/app/_lib/formatar';

// Ações possíveis em cada status (RN08)
const ACOES = {
  RASCUNHO: [{ status: 'ABERTA', rotulo: 'Publicar', principal: true }],
  ABERTA: [{ status: 'PAUSADA', rotulo: 'Pausar' }, { status: 'ENCERRADA', rotulo: 'Encerrar', perigo: true }],
  PAUSADA: [{ status: 'ABERTA', rotulo: 'Reabrir', principal: true }, { status: 'ENCERRADA', rotulo: 'Encerrar', perigo: true }],
  ENCERRADA: [],
};

export default function PaginaMinhasVagas() {
  return <RotaProtegida perfis={['RECRUTADOR']}><Suspense><MinhasVagas /></Suspense></RotaProtegida>;
}

function MinhasVagas() {
  const router = useRouter();
  const salva = useSearchParams().get('salva');
  const [vagas, setVagas] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState(salva ? 'Vaga salva com sucesso.' : '');

  const carregar = useCallback(() => {
    vagasApi.minhas({ status: filtroStatus })
      .then((lista) => { setVagas(lista); setErro(''); })
      .catch((e) => setErro(e.message));
  }, [filtroStatus]);
  useEffect(() => { carregar(); }, [carregar]);

  async function executar(acao, fn, sucesso) {
    setErro('');
    setAviso('');
    try {
      const r = await fn();
      setAviso(typeof sucesso === 'function' ? sucesso(r) : sucesso);
      carregar();
      return r;
    } catch (e) {
      setErro(e.message);
    }
  }

  function mudarStatus(vaga, novo) {
    if (novo === 'ENCERRADA' && !window.confirm(
      `Encerrar "${vaga.titulo}"? Os candidatos ainda em andamento serão marcados como reprovados com o motivo "Vaga encerrada". Uma vaga encerrada não pode ser reaberta.`)) return;
    executar(novo, () => vagasApi.alterarStatus(vaga.id, novo),
      (r) => `Vaga "${vaga.titulo}" agora está ${STATUS_VAGA[novo].toLowerCase()}.` +
        (r.candidaturasEncerradas ? ` ${r.candidaturasEncerradas} candidatura(s) foram encerradas.` : ''));
  }

  async function duplicar(vaga) {
    const r = await executar('duplicar', () => vagasApi.duplicar(vaga.id), 'Cópia criada como rascunho.');
    if (r) router.push(`/empresa/vagas/${r.id}/editar`);
  }

  function excluir(vaga) {
    if (!window.confirm(`Excluir o rascunho "${vaga.titulo}"?`)) return;
    executar('excluir', () => vagasApi.excluir(vaga.id), 'Rascunho excluído.');
  }

  const visiveis = vagas?.filter((v) => v.titulo.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div className="container pagina pilha" style={{ gap: 20 }}>
      <div className="linha entre">
        <h1>Minhas vagas</h1>
        <Link href="/empresa/vagas/nova" className="botao">+ Nova vaga</Link>
      </div>

      <div className="linha">
        <label className="sr-only" htmlFor="busca-minhas">Buscar por título</label>
        <input id="busca-minhas" className="input" style={{ flex: '1 1 260px' }} type="search" placeholder="Buscar por título"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        <label className="linha pequeno texto-2" style={{ gap: 8 }}>Status
          <select className="input" style={{ width: 'auto' }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(STATUS_VAGA).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </label>
      </div>

      <Aviso tipo="sucesso">{aviso}</Aviso>
      <Aviso>{erro}</Aviso>
      {!vagas && !erro && <Carregando />}

      {visiveis?.length === 0 && (
        <EstadoVazio titulo={vagas.length ? 'Nenhuma vaga com esses filtros' : 'Você ainda não criou vagas'}>
          {!vagas.length && <Link href="/empresa/vagas/nova" className="botao">Criar a primeira vaga</Link>}
        </EstadoVazio>
      )}

      {visiveis?.length > 0 && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr><th>Vaga</th><th>Status</th><th>Candidatos</th><th>Publicada em</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {visiveis.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link href={`/vagas/${v.id}`} style={{ fontWeight: 600 }}>{v.titulo}</Link>
                    <div className="texto-2 pequeno">{MODALIDADE[v.modalidade]} · {CONTRATO[v.tipoContrato]} · {v.nivel}</div>
                  </td>
                  <td><StatusVaga status={v.status} /></td>
                  <td>
                    {v.status === 'RASCUNHO' ? '—' : (
                      <Link href={`/empresa/vagas/${v.id}/processo`}>
                        {v.totalCandidaturas} <span className="texto-2 pequeno">({v.emAndamento} em andamento)</span>
                      </Link>
                    )}
                  </td>
                  <td>{data(v.publicadaEm)}</td>
                  <td>
                    <div className="linha">
                      {v.status !== 'ENCERRADA' && <Link href={`/empresa/vagas/${v.id}/editar`} className="botao neutro pequeno">Editar</Link>}
                      {ACOES[v.status].map((a) => (
                        <button key={a.status} type="button"
                          className={`botao pequeno ${a.principal ? '' : a.perigo ? 'perigo' : 'neutro'}`}
                          onClick={() => mudarStatus(v, a.status)}>{a.rotulo}</button>
                      ))}
                      {v.status !== 'RASCUNHO' && <button type="button" className="botao neutro pequeno" onClick={() => duplicar(v)}>Duplicar</button>}
                      {v.status === 'RASCUNHO' && <button type="button" className="botao perigo pequeno" onClick={() => excluir(v)}>Excluir</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
