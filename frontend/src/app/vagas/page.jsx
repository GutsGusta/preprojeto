'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { vagasApi } from '@/app/_lib/servicos';
import { useAuth } from '@/app/_lib/AuthContext';
import CardVaga from '@/app/_components/CardVaga';
import Paginacao from '@/app/_components/Paginacao';
import { Aviso, Carregando, EstadoVazio } from '@/app/_components/Estados';
import { IconeFiltro, IconeLupa } from '@/app/_components/Icones';
import { MODALIDADE, CONTRATO } from '@/app/_lib/formatar';

// Os filtros ficam na URL (?q=...&modalidade=REMOTO,HIBRIDO), assim a busca pode ser compartilhada
const lerFiltros = (p) => ({
  q: p.get('q') || '',
  cidade: p.get('cidade') || '',
  area: p.get('area') || '',
  nivel: p.get('nivel') || '',
  modalidade: p.get('modalidade') ? p.get('modalidade').split(',') : [],
  contrato: p.get('contrato') ? p.get('contrato').split(',') : [],
  salarioMin: p.get('salarioMin') || '',
  ordem: p.get('ordem') || 'recentes',
  page: Number(p.get('page')) || 1,
});

export default function PaginaVagas() {
  return <Suspense fallback={<Carregando />}><ListaVagas /></Suspense>;
}

function ListaVagas() {
  const { ehCandidato, carregando: carregandoLogin } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const setParams = (p) => router.replace(p.toString() ? `${caminho}?${p}` : caminho, { scroll: false });
  const filtros = lerFiltros(params);

  const [opcoes, setOpcoes] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [buscaFeita, setBuscaFeita] = useState(null);   // qual busca o "resultado" responde
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState(filtros.q);
  const [salario, setSalario] = useState(filtros.salarioMin);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  useEffect(() => { vagasApi.filtros().then(setOpcoes).catch(() => setOpcoes(null)); }, []);

  const chave = params.toString();
  useEffect(() => {
    if (carregandoLogin) return; // espera saber se há login (muda o match e os favoritos)
    let ativo = true;
    vagasApi.listar({ ...filtros, size: 10 })
      .then((r) => { if (ativo) { setResultado(r); setErro(''); setBuscaFeita(chave); } })
      .catch((e) => { if (ativo) { setErro(e.message); setBuscaFeita(chave); } });
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, carregandoLogin]);

  // Atualiza um ou mais filtros e volta para a página 1
  function mudar(novos) {
    const proximo = { ...filtros, page: 1, ...novos };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(proximo)) {
      const valor = Array.isArray(v) ? v.join(',') : String(v);
      if (valor && !(k === 'ordem' && valor === 'recentes') && !(k === 'page' && valor === '1')) p.set(k, valor);
    }
    setParams(p);
  }

  const alternarNaLista = (campo, valor) => {
    const lista = filtros[campo];
    mudar({ [campo]: lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor] });
  };

  const buscando = buscaFeita !== chave;

  const temFiltro = filtros.q || filtros.cidade || filtros.area || filtros.nivel || filtros.salarioMin
    || filtros.modalidade.length || filtros.contrato.length;

  return (
    <>
      <section className="busca-topo">
        <div className="container pilha" style={{ gap: 12 }}>
          <h1>Encontre a vaga certa para você</h1>
          <form role="search" onSubmit={(e) => { e.preventDefault(); mudar({ q: busca.trim() }); }}>
            <label className="sr-only" htmlFor="busca">Cargo, palavra-chave ou empresa</label>
            <input id="busca" className="input" type="search" placeholder="Cargo, palavra-chave ou empresa"
              value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button type="submit" className="botao"><IconeLupa />Buscar</button>
          </form>
        </div>
      </section>

      <div className="container pagina">
        <div className="layout-lista">
          <aside className={filtrosAbertos ? '' : 'fechado'} aria-label="Filtros">
            <button type="button" className="botao neutro filtros-botao" style={{ width: '100%', marginBottom: 12 }}
              aria-expanded={filtrosAbertos} onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
              <IconeFiltro />{filtrosAbertos ? 'Esconder filtros' : 'Mostrar filtros'}
            </button>
            <div className="cartao pilha">
              <div className="linha entre">
                <h2>Filtros</h2>
                {temFiltro && (
                  <button type="button" className="botao-link pequeno"
                    onClick={() => { setBusca(''); setSalario(''); setParams(new URLSearchParams()); }}>Limpar</button>
                )}
              </div>

              <label className="campo">Cidade
                <select value={filtros.cidade} onChange={(e) => mudar({ cidade: e.target.value })}>
                  <option value="">Todas</option>
                  {opcoes?.cidades.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <fieldset>
                <legend>Modalidade</legend>
                {Object.entries(MODALIDADE).map(([valor, rotulo]) => (
                  <label key={valor} className="opcao">
                    <input type="checkbox" checked={filtros.modalidade.includes(valor)} onChange={() => alternarNaLista('modalidade', valor)} />
                    {rotulo}
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend>Tipo de contrato</legend>
                {Object.entries(CONTRATO).map(([valor, rotulo]) => (
                  <label key={valor} className="opcao">
                    <input type="checkbox" checked={filtros.contrato.includes(valor)} onChange={() => alternarNaLista('contrato', valor)} />
                    {rotulo}
                  </label>
                ))}
              </fieldset>

              <label className="campo">Nível
                <select value={filtros.nivel} onChange={(e) => mudar({ nivel: e.target.value })}>
                  <option value="">Qualquer nível</option>
                  {opcoes?.niveis.map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>

              <label className="campo">Área
                <select value={filtros.area} onChange={(e) => mudar({ area: e.target.value })}>
                  <option value="">Todas as áreas</option>
                  {opcoes?.areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>

              <form onSubmit={(e) => { e.preventDefault(); mudar({ salarioMin: salario }); }}>
                <label className="campo">Salário a partir de (R$)
                  <input type="number" min="0" step="100" inputMode="numeric" value={salario}
                    onChange={(e) => setSalario(e.target.value)} onBlur={() => salario !== filtros.salarioMin && mudar({ salarioMin: salario })} />
                </label>
              </form>
            </div>
          </aside>

          <main className="pilha" aria-live="polite">
            <div className="linha entre">
              <p>
                {resultado && !buscando
                  ? <><strong>{resultado.total} {resultado.total === 1 ? 'vaga' : 'vagas'}</strong>{filtros.q && <span className="texto-2"> para “{filtros.q}”</span>}</>
                  : <span className="texto-2">Buscando vagas…</span>}
              </p>
              <label className="linha pequeno texto-2" style={{ gap: 8 }}>Ordenar por
                <select className="input" style={{ width: 'auto' }} value={filtros.ordem} onChange={(e) => mudar({ ordem: e.target.value })}>
                  <option value="recentes">Mais recentes</option>
                  <option value="salario">Maior salário</option>
                </select>
              </label>
            </div>

            <Aviso>{erro}</Aviso>
            {buscando && <Carregando rotulo="Buscando vagas" />}
            {!buscando && resultado?.itens.length === 0 && (
              <EstadoVazio titulo="Nenhuma vaga encontrada">
                <p>Tente outras palavras ou remova alguns filtros.</p>
              </EstadoVazio>
            )}
            {!buscando && resultado?.itens.map((v) => <CardVaga key={v.id} vaga={v} mostrarFavorito={ehCandidato} />)}
            {!buscando && resultado && (
              <Paginacao pagina={resultado.pagina} totalPaginas={resultado.totalPaginas}
                aoMudar={(page) => { mudar({ page }); window.scrollTo({ top: 0 }); }} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
