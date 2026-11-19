"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BotaoFavorito from "../_components/BotaoFavorito";
import { candidatoApi, favoritosApi } from "../_lib/servicos";
import { MODALIDADE, STATUS_VAGA, haQuantoTempo, local } from "../_lib/formatar";

function ItemVaga({ vaga, children }) {
    return (
        <div className="item-vaga">
            <div className="txt-item">
                <h4><Link href={`/vagas/${vaga.id}`}>{vaga.titulo}</Link></h4>
                <div className="tags-vaga">
                    <span>{vaga.empresa}</span>
                    <span className="separador">·</span>
                    <span>{MODALIDADE[vaga.modalidade] || vaga.modalidade}</span>
                    {local(vaga) && (
                        <>
                            <span className="separador">·</span>
                            <span>{local(vaga)}</span>
                        </>
                    )}
                    {vaga.status !== "PUBLICADA" && <span className={`status ${vaga.status}`}>{STATUS_VAGA[vaga.status]}</span>}
                </div>
            </div>
            {children}
        </div>
    );
}

export default function FavoritosHistorico() {
    const [favoritas, setFavoritas] = useState(null);
    const [vistas, setVistas] = useState(null);
    const [erroFavoritos, setErroFavoritos] = useState("");
    const [erroHistorico, setErroHistorico] = useState("");

    useEffect(() => {
        favoritosApi.vagas().then(setFavoritas).catch(() => setErroFavoritos("Erro ao carregar favoritos."));
        candidatoApi.historico().then(setVistas).catch(() => setErroHistorico("Erro ao carregar histórico."));
    }, []);

    return (
        <div className="paineis">
            <section className="painel-candidato">
                <div className="txt-vagas">
                    <h3>Vagas favoritas</h3>
                    <Link className="btn-vagas" href="/vagas">Buscar mais</Link>
                </div>
                {erroFavoritos && <p className="erro-candidato">{erroFavoritos}</p>}
                {!favoritas && !erroFavoritos && <p>Carregando...</p>}
                {favoritas?.length === 0 && <p className="texto-cinza">Toque no coração de uma vaga para guardá-la aqui.</p>}
                <div className="lista-vagas">
                    {favoritas?.map((vaga) => (
                        <ItemVaga key={vaga.id} vaga={vaga}>
                            <BotaoFavorito vagaId={vaga.id} favorita
                                aoMudar={(fav) => !fav && setFavoritas((l) => l.filter((x) => x.id !== vaga.id))} />
                        </ItemVaga>
                    ))}
                </div>
            </section>

            <section className="painel-candidato">
                <h3>Vistas recentemente</h3>
                {erroHistorico && <p className="erro-candidato">{erroHistorico}</p>}
                {!vistas && !erroHistorico && <p>Carregando...</p>}
                {vistas?.length === 0 && <p className="texto-cinza">As vagas que você abrir aparecem aqui.</p>}
                <div className="lista-vagas">
                    {vistas?.map((vaga) => (
                        <ItemVaga key={vaga.id} vaga={vaga}>
                            <small className="texto-cinza">{haQuantoTempo(vaga.vistaEm)}</small>
                        </ItemVaga>
                    ))}
                </div>
            </section>
        </div>
    );
}
