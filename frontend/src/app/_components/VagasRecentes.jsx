'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { homeApi } from '../_lib/servicos';
import { MODALIDADE, CONTRATO, local } from '../_lib/formatar';

// Lista as vagas mais recentes da homepage, buscando no backend (GET /api/home/vagas-recentes).
export default function VagasRecentes() {
  const [vagas, setVagas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    homeApi.vagasRecentes()
      .then(setVagas)
      .catch(() => setErro('Não foi possível carregar as vagas agora.'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p>Carregando vagas...</p>;
  if (erro) return <p>{erro}</p>;
  if (vagas.length === 0) return <p>Nenhuma vaga publicada no momento.</p>;

  return (
    <div className="vagas">
      {vagas.map((vaga) => (
        <Link key={vaga.id} href={`/vagas/${vaga.id}`}>
          <article className="card-vaga">
            <div className="txt-detalhe">
              <img src={vaga.logoUrl || '/icon-exemplo.png'} alt="" />
              <div className="txt-nome">
                <h3>{vaga.titulo}</h3>
                <p>{vaga.empresa}</p>
              </div>
            </div>
            <div className="tags-vaga">
              {local(vaga) && (
                <>
                  <span>{local(vaga)}</span>
                  <span className="separador">·</span>
                </>
              )}
              <span>{MODALIDADE[vaga.modalidade] || vaga.modalidade}</span>
              <span className="separador">·</span>
              <span>{CONTRATO[vaga.tipoContrato] || vaga.tipoContrato}</span>
            </div>
            <p className="descricao-vaga">{vaga.descricao}</p>
          </article>
        </Link>
      ))}
    </div>
  );
}
