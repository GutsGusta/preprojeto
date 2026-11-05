'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RotaProtegida from '@/app/_components/RotaProtegida';
import { favoritosApi } from '@/app/_lib/servicos';
import { Aviso, Carregando, EstadoVazio } from '@/app/_components/Estados';
import { StatusVaga } from '@/app/_components/Etiquetas';
import BotaoFavorito from '@/app/_components/BotaoFavorito';
import { MODALIDADE, CONTRATO, local, data } from '@/app/_lib/formatar';

export default function PaginaFavoritas() {
  return <RotaProtegida perfis={['CANDIDATO']}><VagasFavoritas /></RotaProtegida>;
}

function VagasFavoritas() {
  const [vagas, setVagas] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => { favoritosApi.vagas().then(setVagas).catch((e) => setErro(e.message)); }, []);

  return (
    <div className="container pagina pilha">
      <h1>Vagas favoritas</h1>
      <Aviso>{erro}</Aviso>
      {!vagas && !erro && <Carregando />}
      {vagas?.length === 0 && (
        <EstadoVazio titulo="Nenhuma vaga salva ainda">
          <p>Toque no coração de uma vaga para guardá-la aqui.</p>
          <Link href="/vagas" className="botao">Buscar vagas</Link>
        </EstadoVazio>
      )}
      <div className="grade grade-2">
        {vagas?.map((v) => (
          <article key={v.id} className="cartao pilha" style={{ gap: 10 }}>
            <div className="linha entre" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3><Link href={`/vagas/${v.id}`}>{v.titulo}</Link></h3>
                <p className="texto-2 pequeno">{[v.empresa, local(v), MODALIDADE[v.modalidade], CONTRATO[v.tipoContrato]].filter(Boolean).join(' · ')}</p>
              </div>
              {v.status !== 'ABERTA' && <StatusVaga status={v.status} />}
            </div>
            <div className="linha entre">
              <span className="texto-2 pequeno">Salva em {data(v.salvaEm)}</span>
              <BotaoFavorito vagaId={v.id} favorita aoMudar={(fav) => !fav && setVagas((l) => l.filter((x) => x.id !== v.id))} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
