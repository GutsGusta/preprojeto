"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

export default function AdminDashboard() {
    const [pagina, setPagina] = useState("Visão geral");
    const [busca, setBusca] = useState("");
    const [filtroPerfil, setFiltroPerfil] = useState("Todos");
    const [filtroSituacao, setFiltroSituacao] = useState("Todos");

    const menus = [
        "Visão geral",
        "Usuários",
        "Empresas",
        "Relatórios gerais",
    ];

    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [vagasEmpresa, setVagasEmpresa] = useState([]);
    const [carregandoVagas, setCarregandoVagas] = useState(false);
    const [erroVagas, setErroVagas] = useState("");
    const [relatorioCandidaturas, setRelatorioCandidaturas] = useState([]);
    const [buscaEmpresa, setBuscaEmpresa] = useState("");

    useEffect(() => {
        async function carregarUsuarios() {
            try {
                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/usuarios`
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar usuários");
                }

                const dados = await resposta.json();
                setUsuarios(dados);
            } catch (erro) {
                console.error("Erro ao carregar usuários:", erro);
            }
        }

        carregarUsuarios();
    }, []);

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const correspondeBusca =
            usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
            usuario.email.toLowerCase().includes(busca.toLowerCase());

        const correspondePerfil =
            filtroPerfil === "Todos" ||
            usuario.perfil.toLowerCase() === filtroPerfil.toLowerCase();

        const correspondeSituacao =
            filtroSituacao === "Todos" ||
            (filtroSituacao === "Ativo" && Boolean(usuario.ativo)) ||
            (filtroSituacao === "Inativo" && !Boolean(usuario.ativo));

        return correspondeBusca && correspondePerfil && correspondeSituacao;
    });

    useEffect(() => {
        async function carregarRelatorioCandidaturas() {
            try {
                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/relatorios/candidaturas`
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao carregar relatório de candidaturas");
                }

                const dados = await resposta.json();
                setRelatorioCandidaturas(dados);
            } catch (erro) {
                console.error("Erro ao carregar relatório:", erro);
            }
        }

        carregarRelatorioCandidaturas();
    }, []);

    useEffect(() => {
        async function carregarEmpresas() {
            try {
                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/empresas`
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar empresas");
                }

                const dados = await resposta.json();
                setEmpresas(dados);
            } catch (erro) {
                console.error("Erro ao carregar empresas:", erro);
            }
        }

        carregarEmpresas();
    }, []);

    const [resumo, setResumo] = useState({
        candidatos: 0,
        empresas: 0,
        vagasAbertas: 0,
        totalCandidaturas: 0,
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarResumo() {
            try {
                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/resumo`
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar os indicadores.");
                }

                const dados = await resposta.json();
                setResumo(dados);
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarResumo();
    }, []);

    useEffect(() => {
        if (!empresaSelecionada) {
            setVagasEmpresa([]);
            setErroVagas("");
            return;
        }

        async function carregarVagas() {
            setCarregandoVagas(true);
            setErroVagas("");
            setVagasEmpresa([]);

            try {
                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/empresas/${empresaSelecionada.id}/vagas`
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar vagas da empresa");
                }

                const dados = await resposta.json();
                setVagasEmpresa(dados);
            } catch (erro) {
                setErroVagas(erro.message);
            } finally {
                setCarregandoVagas(false);
            }
        }

        carregarVagas();
    }, [empresaSelecionada]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <strong>JobMatch</strong>
                    <span className={styles.adminBadge}>Admin</span>
                </div>
                <span>Administrador</span>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    {menus.map((menu) => (
                        <button
                            key={menu}
                            className={`${styles.menuItem} ${pagina === menu ? styles.active : ""
                                }`}
                            onClick={() => setPagina(menu)}
                        >
                            {menu}
                        </button>
                    ))}
                </aside>

                <main className={styles.main}>
                    <h1>{pagina === "Visão geral" ? "Visão geral da plataforma" : pagina}</h1>

                    {pagina === "Visão geral" ? (
                        <>
                            <section className={styles.indicadores}>
                                {[
                                    ["Candidatos", resumo.candidatos],
                                    ["Empresas", resumo.empresas],
                                    ["Vagas abertas", resumo.vagasAbertas],
                                    ["Candidaturas", resumo.totalCandidaturas]
                                ].map(([titulo, valor]) => (
                                    <div className={styles.card} key={titulo}>
                                        <p>{titulo}</p>
                                        <h2>{valor}</h2>
                                    </div>
                                ))}
                            </section>

                            <section className={styles.painel}>
                                <div className={styles.painelHeader}>
                                    <h2>Usuários recentes</h2>
                                    <input
                                        placeholder="Buscar por nome ou e-mail"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                </div>

                                <div className={styles.tableWrapper}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Perfil</th>
                                                <th>Situação</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosFiltrados.map((usuario) => (
                                                <tr key={usuario.email}>
                                                    <td>{usuario.nome} - {usuario.email}</td>
                                                    <td>{usuario.perfil}</td>
                                                    <td>{usuario.ativo ? "Ativo" : "Bloqueado"}</td>
                                                    <td><button
                                                        type="button"
                                                        onClick={() => setUsuarioSelecionado(usuario)}
                                                    >
                                                        Gerenciar
                                                    </button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : pagina === "Usuários" ? (
                        <section className={styles.painel}>
                            <div className={styles.painelHeader}>
                                <h2>Gerenciamento de usuários</h2>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou e-mail"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                />
                            </div>

                            <p>Consulte os usuários cadastrados na plataforma.</p>

                            <div className={styles.filtros}>
                                <select
                                    value={filtroPerfil}
                                    onChange={(e) => setFiltroPerfil(e.target.value)}
                                >
                                    <option value="Todos">Todos os perfis</option>
                                    <option value="CANDIDATO">Candidatos</option>
                                    <option value="RECRUTADOR">Recrutadores</option>
                                    <option value="ADMIN">Administradores</option>
                                </select>

                                <select
                                    value={filtroSituacao}
                                    onChange={(e) => setFiltroSituacao(e.target.value)}
                                >
                                    <option value="Todos">Todas as situações</option>
                                    <option value="Ativo">Ativos</option>
                                    <option value="Inativo">Bloqueados</option>
                                </select>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>E-mail</th>
                                            <th>Perfil</th>
                                            <th>Situação</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {usuariosFiltrados.map((usuario) => (
                                            <tr key={usuario.email}>
                                                <td>{usuario.nome}</td>
                                                <td>{usuario.email}</td>
                                                <td>{usuario.perfil}</td>
                                                <td>
                                                    {usuario.ativo ? "Ativo" : "Bloqueado"}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => setUsuarioSelecionado(usuario)}
                                                    >
                                                        Gerenciar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {usuariosFiltrados.length === 0 && (
                                    <p>Nenhum usuário encontrado.</p>
                                )}
                            </div>
                        </section>
                    ) : pagina === "Empresas" ? (
                        <section className={styles.painel}>
                            <div className={styles.painelHeader}>
                                <h2>Gerenciamento de empresas</h2>

                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou CNPJ"
                                    value={buscaEmpresa}
                                    onChange={(e) => setBuscaEmpresa(e.target.value)}
                                />
                            </div>

                            <p>Consulte as empresas cadastradas na plataforma.</p>

                            <div className={styles.tableWrapper}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Empresa</th>
                                            <th>CNPJ</th>
                                            <th>Setor</th>
                                            <th>Localização</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {empresas
                                            .filter((empresa) => {
                                                const pesquisa = buscaEmpresa.toLowerCase().trim();

                                                return (
                                                    String(empresa.nome ?? "")
                                                        .toLowerCase()
                                                        .includes(pesquisa) ||
                                                    String(empresa.cnpj ?? "")
                                                        .toLowerCase()
                                                        .includes(pesquisa)
                                                );
                                            })
                                            .map((empresa) => (
                                                <tr key={empresa.id}>
                                                    <td>{empresa.nome}</td>
                                                    <td>{empresa.cnpj}</td>
                                                    <td>{empresa.setor || "Não informado"}</td>
                                                    <td>
                                                        {[empresa.cidade, empresa.uf]
                                                            .filter(Boolean)
                                                            .join(" - ") || "Não informado"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEmpresaSelecionada(empresa)}
                                                        >
                                                            Gerenciar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ) : pagina === "Relatórios gerais" ? (
                        <>
                            <section className={styles.indicadores}>
                                {[
                                    ["Total de candidatos", resumo.candidatos],
                                    ["Total de empresas", resumo.empresas],
                                    ["Vagas abertas", resumo.vagasAbertas],
                                    ["Total de candidaturas", resumo.totalCandidaturas]
                                ].map(([titulo, valor]) => (
                                    <div className={styles.card} key={titulo}>
                                        <p>{titulo}</p>
                                        <h2>{valor}</h2>
                                    </div>
                                ))}
                            </section>

                            <section className={styles.painel}>
                                <h2>Candidaturas por status</h2>

                                <p>
                                    Distribuição das candidaturas registradas
                                    na plataforma.
                                </p>

                                <div style={{ marginTop: "25px" }}>
                                    {relatorioCandidaturas.length === 0 ? (
                                        <p>Nenhuma candidatura encontrada.</p>
                                    ) : (
                                        relatorioCandidaturas.map((item) => {
                                            const total = relatorioCandidaturas.reduce(
                                                (soma, atual) => soma + Number(atual.quantidade),
                                                0
                                            );

                                            const percentual = total > 0
                                                ? (Number(item.quantidade) / total) * 100
                                                : 0;

                                            const nomesStatus = {
                                                ENVIADA: "Enviadas",
                                                EM_ANALISE: "Em análise",
                                                ENTREVISTA: "Entrevista",
                                                APROVADO: "Aprovadas",
                                                REPROVADO: "Reprovadas"
                                            };

                                            return (
                                                <div key={item.status} style={{ marginBottom: "22px" }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginBottom: "8px"
                                                        }}
                                                    >
                                                        <strong>
                                                            {nomesStatus[item.status] || item.status}
                                                        </strong>

                                                        <span>
                                                            {item.quantidade} ({percentual.toFixed(1)}%)
                                                        </span>
                                                    </div>

                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: "18px",
                                                            backgroundColor: "#e5e7eb",
                                                            borderRadius: "10px",
                                                            overflow: "hidden"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: `${percentual}%`,
                                                                height: "100%",
                                                                backgroundColor: "#2563eb",
                                                                borderRadius: "10px"
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        </>
                    ) : (
                        <section className={styles.painel}>
                            <p>Área de {pagina.toLowerCase()} em desenvolvimento.</p>
                        </section>
                    )}
                </main>
            </div>


            {usuarioSelecionado && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setUsuarioSelecionado(null)}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Detalhes do usuário"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Detalhes do usuário</h2>

                        <p>
                            <strong>Nome:</strong> {usuarioSelecionado.nome}
                        </p>

                        <p>
                            <strong>E-mail:</strong> {usuarioSelecionado.email}
                        </p>

                        <p>
                            <strong>Perfil:</strong> {usuarioSelecionado.perfil}
                        </p>

                        <p>
                            <strong>Situação:</strong>{" "}
                            {usuarioSelecionado.ativo ? "Ativo" : "Bloqueado"}
                        </p>

                        <button
                            type="button"
                            className={styles.modalFechar}
                            onClick={() => setUsuarioSelecionado(null)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {empresaSelecionada && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setEmpresaSelecionada(null)}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Detalhes da empresa"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Detalhes da empresa</h2>

                        <p>
                            <strong>Nome:</strong> {empresaSelecionada.nome}
                        </p>

                        <p>
                            <strong>Razão social:</strong>{" "}
                            {empresaSelecionada.razao_social || "Não informado"}
                        </p>

                        <p>
                            <strong>CNPJ:</strong> {empresaSelecionada.cnpj}
                        </p>

                        <p>
                            <strong>Setor:</strong>{" "}
                            {empresaSelecionada.setor || "Não informado"}
                        </p>

                        <p>
                            <strong>Localização:</strong>{" "}
                            {[empresaSelecionada.cidade, empresaSelecionada.uf]
                                .filter(Boolean)
                                .join(" - ") || "Não informado"}
                        </p>

                        <h3>Vagas publicadas</h3>

                        {carregandoVagas ? (
                            <p>Carregando vagas...</p>
                        ) : erroVagas ? (
                            <p>{erroVagas}</p>
                        ) : vagasEmpresa.length === 0 ? (
                            <p>Nenhuma vaga cadastrada.</p>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Vaga</th>
                                            <th>Status</th>
                                            <th>Modalidade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vagasEmpresa.map((vaga) => (
                                            <tr key={vaga.id}>
                                                <td>{vaga.titulo}</td>
                                                <td>{vaga.status}</td>
                                                <td>{vaga.modalidade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <button
                            type="button"
                            className={styles.modalFechar}
                            onClick={() => setEmpresaSelecionada(null)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}