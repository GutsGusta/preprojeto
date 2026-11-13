'use client';

import Link from 'next/link';
import { MODALIDADE, CONTRATO, faixaSalarial, local, haQuantoTempo } from '../_lib/formatar';
import { LogoEmpresa, Match } from './Etiquetas';
import BotaoFavorito from './BotaoFavorito';
import { IconeLocal, IconeMaleta } from './Icones';

export default function CardVaga({ vaga, mostrarFavorito }) {
  return (
    <article className="cartao card-vaga">
      <LogoEmpresa empresa={vaga.empresa} />
      <div className="pilha" style={{ gap: 6, flex: 1, minWidth: 0 }}>
        <h3><Link href={`/vagas/${vaga.id}`}>{vaga.titulo}</Link></h3>
        <p className="texto-2 pequeno">{vaga.empresa.nome} · publicada {haQuantoTempo(vaga.publicadaEm)}</p>
        <p className="linha pequeno" style={{ gap: 14 }}>
          {local(vaga) && <span className="linha" style={{ gap: 4 }}><IconeLocal />{local(vaga)}</span>}
          <span className="linha" style={{ gap: 4 }}><IconeMaleta />{MODALIDADE[vaga.modalidade]} · {CONTRATO[vaga.tipoContrato]} · {vaga.nivel}</span>
        </p>
        <p className="pequeno"><strong>{faixaSalarial(vaga.salarioMin, vaga.salarioMax)}</strong></p>
        {vaga.habilidades?.length > 0 && (
          <ul className="chips" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="Habilidades">
            {vaga.habilidades.slice(0, 5).map((h) => <li key={h} className="tag">{h}</li>)}
          </ul>
        )}
      </div>
      <div className="lateral">
        <Match valor={vaga.match} />
        {mostrarFavorito && <BotaoFavorito vagaId={vaga.id} favorita={vaga.favorita} />}
      </div>
    </article>
  );
}
