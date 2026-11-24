"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./candidato.css";
import RotaProtegida from "../_components/RotaProtegida";
import { useAuth } from "../_lib/AuthContext";
import { candidatoApi } from "../_lib/servicos";
import { MODALIDADE, CONTRATO, data, iniciais, local } from "../_lib/formatar";
import MeuCurriculo from "./MeuCurriculo";
import MinhasCandidaturas from "./MinhasCandidaturas";
import FavoritosHistorico from "./FavoritosHistorico";
import Configuracoes from "./Configuracoes";

const menus = [
    "Dashboard",
    "Meu currículo",
    "Minhas candidaturas",
    "Favoritos e histórico",
    "Configurações",
];

const STATUS_AVANCO = ["ENTREVISTA", "APROVADA"];
const STATUS_ENCERRADO = ["REPROVADA", "DESISTENCIA"];
const NOME_STATUS = {
    ENVIADA: "Enviada",
    EM_ANALISE: "Triagem",
    ENTREVISTA: "Entrevista",
    APROVADA: "Aprovada",
};

function useCarregar(buscar, mensagemErro, versao = 0) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        buscar()
            .then(setDados)
            .catch(() => setErro(mensagemErro))
            .finally(() => setCarregando(false));
    }, [versao]);

    return { dados, carregando, erro };
}

function descreverAtualizacao(atualizacao) {
    const { status, etapa, vaga } = atualizacao;

    if (STATUS_ENCERRADO.includes(status)) {
        return { cor: "vermelha", texto: <>Processo encerrado em {vaga}</> };
    }

    if (STATUS_AVANCO.includes(status)) {
        return {
            cor: "verde",
            texto: <>Você avançou para <strong>{etapa || NOME_STATUS[status]}</strong> em {vaga}</>,
        };
    }

    return {
        cor: "laranja",
        texto: <>Candidatura em <strong>{NOME_STATUS[status] || "Triagem"}</strong> em {vaga}</>,
    };
}

function PainelCandidato() {
    const { usuario, sair } = useAuth();
    const [pagina, setPagina] = useState("Dashboard");
    const [versao, setVersao] = useState(0);

    const resumo = useCarregar(candidatoApi.resumo, "Erro ao carregar indicadores. Verifique a conexão com o servidor.", versao);
    const recomendadas = useCarregar(candidatoApi.vagasRecomendadas, "Erro ao carregar vagas. Verifique a conexão com o servidor.");
    const atualizacoes = useCarregar(candidatoApi.atualizacoes, "Erro ao carregar atualizações. Verifique a conexão com o servidor.");

    const primeiroNome = usuario.nome.split(" ")[0];
    const percentual = resumo.dados?.curriculoPreenchido ?? 0;

    return (
        <div className="container-candidato">
            <header className="cabecalho-candidato">
                <Link href="/" className="logo-candidato">JobMatch</Link>
                <div className="usuario-candidato">
                    <span className="avatar-candidato">
                        {usuario.fotoUrl ? (
                            <img
                                src={usuario.fotoUrl}
                                alt="Foto de perfil"
                            />
                        ) : (
                            iniciais(usuario.nome)
                        )}
                    </span>
                    <span>{usuario.nome}</span>
                    <Link href="/" className="btn-sair" onClick={sair}>Sair</Link>
                </div>
            </header>

            <div className="layout-candidato">
                <aside className="barra-lateral">
                    {menus.map((menu) => (
                        <button
                            key={menu}
                            className={pagina === menu ? "ativo" : ""}
                            onClick={() => setPagina(menu)}
                        >
                            {menu}
                        </button>
                    ))}
                </aside>

                <div className="principal-candidato">
                    {pagina !== "Dashboard" ? (
                        <>
                            <h1>{pagina}</h1>
                            {pagina === "Meu currículo" && <MeuCurriculo aoSalvar={() => setVersao(versao + 1)} />}
                            {pagina === "Minhas candidaturas" && <MinhasCandidaturas />}
                            {pagina === "Favoritos e histórico" && <FavoritosHistorico />}
                            {pagina === "Configurações" && <Configuracoes />}
                        </>
                    ) : (
                        <>
                            <h1>Olá, {primeiroNome}</h1>

                            {resumo.carregando && <p>Carregando indicadores...</p>}
                            {resumo.erro && <p className="erro-candidato">{resumo.erro}</p>}

                            {resumo.dados && (
                                <div className="info">
                                    <article className="card-info">
                                        <p>Candidaturas ativas</p>
                                        <h2>{resumo.dados.candidaturasAtivas}</h2>
                                    </article>
                                    <article className="card-info">
                                        <p>Entrevistas marcadas</p>
                                        <h2>{resumo.dados.entrevistasMarcadas}</h2>
                                    </article>
                                    <article className="card-info">
                                        <p>Vagas favoritas</p>
                                        <h2>{resumo.dados.vagasFavoritas}</h2>
                                    </article>
                                    <article className="card-info">
                                        <p>Currículo preenchido</p>
                                        <h2>{percentual}%</h2>
                                        <div className="barra-progresso">
                                            <div className="preenchimento" style={{ width: `${percentual}%` }} />
                                        </div>
                                    </article>
                                </div>
                            )}

                            <div className="paineis">
                                <section className="painel-candidato">
                                    <div className="txt-vagas">
                                        <h3>Vagas recomendadas para você</h3>
                                        <Link className="btn-vagas" href="/vagas">Ver todas</Link>
                                    </div>

                                    {recomendadas.carregando && <p>Carregando vagas...</p>}
                                    {recomendadas.erro && <p className="erro-candidato">{recomendadas.erro}</p>}
                                    {recomendadas.dados?.length === 0 && <p>Nenhuma vaga disponível no momento.</p>}

                                    <div className="lista-vagas">
                                        {recomendadas.dados?.map((vaga) => (
                                            <Link key={vaga.id} href={`/vagas/${vaga.id}`} className="item-vaga">
                                                <div className="txt-item">
                                                    <h4>{vaga.titulo}</h4>
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
                                                    </div>
                                                </div>
                                                <span className="tag-contrato">
                                                    {CONTRATO[vaga.tipoContrato] || vaga.tipoContrato}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                <section className="painel-candidato">
                                    <h3>Últimas atualizações</h3>

                                    {atualizacoes.carregando && <p>Carregando atualizações...</p>}
                                    {atualizacoes.erro && <p className="erro-candidato">{atualizacoes.erro}</p>}
                                    {atualizacoes.dados?.length === 0 && <p>Você ainda não tem atualizações.</p>}

                                    <ul className="lista-atualizacoes">
                                        {atualizacoes.dados?.map((atualizacao, i) => {
                                            const { cor, texto } = descreverAtualizacao(atualizacao);
                                            return (
                                                <li key={i}>
                                                    <span className={`bolinha ${cor}`} />
                                                    <div>
                                                        <p>{texto}</p>
                                                        <small>{data(atualizacao.ocorridaEm)}</small>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CandidatoDashboard() {
    return (
        <RotaProtegida perfis={["CANDIDATO"]}>
            <PainelCandidato />
        </RotaProtegida>
    );
}
