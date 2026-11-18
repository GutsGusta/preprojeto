"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { candidatoApi, candidaturasApi } from "../_lib/servicos";
import { FINAIS, STATUS_CANDIDATURA, data } from "../_lib/formatar";

export default function MinhasCandidaturas() {
    const [lista, setLista] = useState(null);
    const [erro, setErro] = useState("");
    const [aberta, setAberta] = useState(null);
    const [historico, setHistorico] = useState([]);

    function carregar() {
        candidatoApi.candidaturas()
            .then(setLista)
            .catch(() => setErro("Erro ao carregar candidaturas. Verifique a conexão com o servidor."));
    }

    useEffect(carregar, []);

    async function verHistorico(id) {
        if (aberta === id) return setAberta(null);
        setAberta(id);
        setHistorico([]);
        try {
            const detalhe = await candidaturasApi.detalhar(id);
            setHistorico(detalhe.historico);
        } catch (falha) {
            setErro(falha.message);
        }
    }

    async function desistir(id) {
        if (!window.confirm("Deseja mesmo desistir desta candidatura? Essa ação não pode ser desfeita.")) return;
        try {
            await candidaturasApi.desistir(id);
            carregar();
        } catch (falha) {
            setErro(falha.message);
        }
    }

    if (!lista) return erro ? <p className="erro-candidato">{erro}</p> : <p>Carregando candidaturas...</p>;

    if (lista.length === 0) {
        return (
            <section className="painel-candidato vazio-candidato">
                <h3>Você ainda não se candidatou a nenhuma vaga</h3>
                <p>Encontre oportunidades que combinam com o seu perfil.</p>
                <Link href="/vagas" className="btn-salvar">Buscar vagas</Link>
            </section>
        );
    }

    return (
        <div className="lista-candidaturas">
            {erro && <p className="erro-candidato">{erro}</p>}
            {lista.map((c) => {
                const finalizada = FINAIS.includes(c.status);
                return (
                    <article key={c.id} className="painel-candidato card-candidatura">
                        <div className="txt-vagas">
                            <div className="txt-item">
                                <h4><Link href={`/vagas/${c.vagaId}`}>{c.vaga}</Link></h4>
                                <div className="tags-vaga">
                                    <span>{c.empresa}</span>
                                    <span className="separador">·</span>
                                    <span>Enviada em {data(c.enviadaEm)}</span>
                                </div>
                            </div>
                            <span className={`status ${c.status}`}>{STATUS_CANDIDATURA[c.status]}</span>
                        </div>

                        {!finalizada && c.totalEtapas > 0 && (
                            <div className="etapas-candidatura">
                                <p>Etapa {c.etapaOrdem || 1} de {c.totalEtapas}: <strong>{c.etapa || "Triagem"}</strong></p>
                                <div className="progresso-etapas">
                                    {Array.from({ length: c.totalEtapas }, (_, i) => (
                                        <span key={i} className={i < (c.etapaOrdem || 1) ? "feito" : ""} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="acoes-candidatura">
                            <button type="button" className="btn-vagas" onClick={() => verHistorico(c.id)}>
                                {aberta === c.id ? "Esconder histórico" : "Ver histórico"}
                            </button>
                            {!finalizada && (
                                <button type="button" className="btn-remover" onClick={() => desistir(c.id)}>Desistir</button>
                            )}
                        </div>

                        {aberta === c.id && (
                            <ul className="lista-atualizacoes historico-candidatura">
                                {historico.length === 0 && <li>Carregando...</li>}
                                {historico.map((h) => (
                                    <li key={h.id}>
                                        <span className={`bolinha ${h.status === "REPROVADA" || h.status === "DESISTENCIA" ? "vermelha" : h.status === "APROVADA" ? "verde" : "laranja"}`} />
                                        <div>
                                            <p><strong>{h.etapa || STATUS_CANDIDATURA[h.status]}</strong> · {STATUS_CANDIDATURA[h.status] || h.status}</p>
                                            {h.motivo && <p>Motivo: {h.motivo}</p>}
                                            {h.feedback && <p>“{h.feedback}”</p>}
                                            <small>{data(h.data)}</small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
