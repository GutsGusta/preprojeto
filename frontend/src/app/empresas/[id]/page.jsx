"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../empresas.css";
import { empresasApi } from "../../_lib/servicos";
import { LogoEmpresa } from "../../_components/Etiquetas";
import { Aviso, Carregando, EstadoVazio } from "../../_components/Estados";
import CardVaga from "../../_components/CardVaga";
import { IconeVoltar } from "../../_components/Icones";

export default function PerfilEmpresa() {
    const { id } = useParams();
    const [empresa, setEmpresa] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        empresasApi.detalhar(id)
            .then(setEmpresa)
            .catch((falha) => setErro(falha.status === 404 ? "nao_encontrada" : falha.message));
    }, [id]);

    if (erro === "nao_encontrada") {
        return (
            <div className="container pagina">
                <EstadoVazio titulo="Empresa não encontrada">
                    <Link href="/empresas" className="botao">Ver todas as empresas</Link>
                </EstadoVazio>
            </div>
        );
    }

    if (!empresa) return <div className="container pagina">{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</div>;

    const local = [empresa.cidade, empresa.uf].filter(Boolean).join(", ");

    return (
        <div className="container pagina pilha" style={{ gap: 20 }}>
            <Link href="/empresas" className="linha pequeno" style={{ gap: 4, width: "fit-content" }}><IconeVoltar />Todas as empresas</Link>

            <section className="cartao perfil-empresa">
                <LogoEmpresa empresa={empresa} grande />
                <div className="pilha" style={{ gap: 6 }}>
                    <h1>{empresa.nome}</h1>
                    <p className="texto-2">{[empresa.setor, local].filter(Boolean).join(" · ")}</p>
                    {empresa.site && <a href={empresa.site} target="_blank" rel="noreferrer" className="pequeno">{empresa.site.replace(/^https?:\/\//, "")}</a>}
                </div>
                <div className="numero-empresa">
                    <strong>{empresa.vagas.length}</strong>
                    <span>vaga{empresa.vagas.length === 1 ? "" : "s"} aberta{empresa.vagas.length === 1 ? "" : "s"}</span>
                </div>
            </section>

            {empresa.descricao && (
                <section className="cartao pilha" style={{ gap: 8 }}>
                    <h2>Sobre a empresa</h2>
                    <p className="texto-longo">{empresa.descricao}</p>
                </section>
            )}

            <section className="pilha">
                <h2>Vagas abertas</h2>
                {empresa.vagas.length === 0 ? (
                    <EstadoVazio titulo="Nenhuma vaga aberta no momento">
                        <p>Volte em breve ou veja vagas de outras empresas.</p>
                        <Link href="/vagas" className="botao">Buscar vagas</Link>
                    </EstadoVazio>
                ) : (
                    empresa.vagas.map((vaga) => <CardVaga key={vaga.id} vaga={vaga} />)
                )}
            </section>
        </div>
    );
}
