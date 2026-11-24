
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RotaProtegida from "../_components/RotaProtegida";
import { useAuth } from "../_lib/AuthContext";
import { vagasApi } from "../_lib/servicos";
import { iniciais } from "../_lib/formatar";
import "../candidato/candidato.css";
import "./empresa.css";

function PainelEmpresa() {
    const { usuario, sair } = useAuth();

    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const nomeEmpresa = usuario.empresaNome || usuario.nome;

    useEffect(() => {
        let ativo = true;

        async function carregarVagas() {
            try {
                const lista = [];
                let pagina = 1;
                let totalPaginas = 1;

                do {
                    const resposta = await vagasApi.minhas({
                        page: pagina,
                        size: 50,
                    });

                    if (Array.isArray(resposta)) {
                        lista.push(...resposta);
                        break;
                    }

                    if (!Array.isArray(resposta?.itens)) {
                        throw new Error(
                            "Formato inesperado na resposta de vagas."
                        );
                    }

                    lista.push(...resposta.itens);
                    totalPaginas = Number(resposta.totalPaginas) || 1;
                    pagina++;
                } while (pagina <= totalPaginas);

                if (ativo) setVagas(lista);

            } catch (erro) {
                if (ativo) {
                    setErro(
                        erro.message || "Erro ao carregar indicadores."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarVagas();

        return () => {
            ativo = false;
        };
    }, []);

    const totalVagas = vagas.length;

    const vagasPublicadas = vagas.filter(
        vaga => vaga.status === "PUBLICADA"
    ).length;

    const vagasEncerradas = vagas.filter(
        vaga => vaga.status === "ENCERRADA"
    ).length;

    const temContagem = vagas.every(
        vaga => vaga.totalCandidaturas != null &&
            Number.isFinite(Number(vaga.totalCandidaturas))
    );

    const totalCandidaturas = temContagem
        ? vagas.reduce(
            (total, vaga) => total + Number(vaga.totalCandidaturas),
            0
        )
        : null;

    const vagasOrdenadas = [...vagas].sort(
        (a, b) =>
            Number(b.totalCandidaturas || 0) -
            Number(a.totalCandidaturas || 0)
    );

    const maiorQuantidade = Math.max(
        1,
        ...vagas.map(vaga => Number(vaga.totalCandidaturas || 0))
    );

    const statusVaga = {
        PUBLICADA: "Publicada",
        ENCERRADA: "Encerrada",
        RASCUNHO: "Rascunho",
    };

    return (
        <div className="container-candidato dashboard-empresa">

            <header className="cabecalho-candidato">
                <Link href="/" className="logo-candidato">
                    JobMatch
                </Link>

                <div className="usuario-candidato">
                    <span className="avatar-candidato">
                        {usuario.fotoUrl ? (
                            <img
                                src={usuario.fotoUrl}
                                alt="Foto de perfil"
                            />
                        ) : (
                            iniciais(nomeEmpresa)
                        )}
                    </span>

                    <span>{nomeEmpresa}</span>

                    <Link
                        href="/"
                        className="btn-sair"
                        onClick={sair}
                    >
                        Sair
                    </Link>
                </div>
            </header>

            <div className="layout-candidato">

                <aside className="barra-lateral">
                    <Link href="/empresa" className="ativo">
                        Dashboard
                    </Link>

                    <Link href="/empresa/vagas">
                        Minhas vagas
                    </Link>

                </aside>

                <div className="principal-candidato">

                    <div className="empresa-boas-vindas">
                        <div>
                            <h1>Olá, {nomeEmpresa}</h1>

                            <p>
                                Acompanhe suas vagas e processos seletivos.
                            </p>
                        </div>

                        <Link
                            href="/empresa/vagas/nova"
                            className="empresa-btn-nova"
                        >
                            + Nova vaga
                        </Link>
                    </div>

                    {carregando && (
                        <p>Carregando indicadores...</p>
                    )}

                    {erro && (
                        <p className="erro-candidato">{erro}</p>
                    )}

                    {!carregando && !erro && (
                        <>
                            <div className="info">

                                <article className="card-info">
                                    <p>Total de vagas</p>
                                    <h2>{totalVagas}</h2>
                                </article>

                                <article className="card-info">
                                    <p>Vagas publicadas</p>
                                    <h2>{vagasPublicadas}</h2>
                                </article>

                                <article className="card-info">
                                    <p>Candidaturas recebidas</p>
                                    <h2>{totalCandidaturas ?? "—"}</h2>
                                </article>

                                <article className="card-info">
                                    <p>Vagas encerradas</p>
                                    <h2>{vagasEncerradas}</h2>
                                </article>

                            </div>

                            <div className="paineis">

                                <section className="painel-candidato">
                                    <div className="txt-vagas">
                                        <h3>Minhas vagas</h3>

                                        <Link
                                            href="/empresa/vagas"
                                            className="btn-vagas"
                                        >
                                            Ver todas
                                        </Link>
                                    </div>

                                    {vagas.length === 0 && (
                                        <p>
                                            Você ainda não cadastrou vagas.
                                        </p>
                                    )}

                                    <div className="lista-vagas">
                                        {vagas.slice(0, 5).map(vaga => (
                                            <Link
                                                key={vaga.id}
                                                href={`/empresa/vagas/${vaga.id}/processo`}
                                                className="item-vaga"
                                            >
                                                <div className="txt-item">
                                                    <h4>{vaga.titulo}</h4>

                                                    <div className="tags-vaga">
                                                        <span>
                                                            {vaga.totalCandidaturas != null
                                                                ? `${vaga.totalCandidaturas} candidaturas`
                                                                : "Ver candidaturas"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`empresa-status ${String(vaga.status).toLowerCase()}`}
                                                >
                                                    {statusVaga[vaga.status] || vaga.status}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                <section className="painel-candidato">
                                    <h3>Candidaturas por vaga</h3>

                                    {vagas.length === 0 && (
                                        <p>Nenhuma vaga cadastrada.</p>
                                    )}

                                    {!temContagem && (
                                        <p>
                                            Contagem de candidaturas indisponível.
                                        </p>
                                    )}

                                    {temContagem && (
                                        <div className="empresa-grafico">
                                            {vagasOrdenadas.slice(0, 5).map(vaga => (
                                                <div
                                                    className="empresa-grafico-item"
                                                    key={vaga.id}
                                                >
                                                    <div className="empresa-grafico-titulo">
                                                        <span>{vaga.titulo}</span>

                                                        <strong>
                                                            {vaga.totalCandidaturas}
                                                        </strong>
                                                    </div>

                                                    <div className="empresa-grafico-barra">
                                                        <div
                                                            className="empresa-grafico-preenchimento"
                                                            style={{
                                                                width: `${Number(vaga.totalCandidaturas) / maiorQuantidade * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EmpresaDashboard() {
    return (
        <RotaProtegida perfis={["RECRUTADOR"]}>
            <PainelEmpresa />
        </RotaProtegida>
    );
}
