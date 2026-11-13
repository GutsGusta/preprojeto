"use client";

import { api } from "../_lib/api";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../_lib/AuthContext";

export default function AdminDashboard() {
    const router = useRouter();
    const { usuario, carregando: carregandoAuth, ehAdmin } = useAuth();

    useEffect(() => {
        if (carregandoAuth) return;

        if (!usuario) {
            router.replace("/login?voltar=/admin");
        } else if (!ehAdmin) {
            router.replace("/");
        }
    }, [usuario, carregandoAuth, ehAdmin, router]);
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
    const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
    const [erroUsuarios, setErroUsuarios] = useState("");
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [processandoUsuario, setProcessandoUsuario] = useState(false);
    const [erroGerenciamento, setErroGerenciamento] = useState("");
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
    const [erroEmpresas, setErroEmpresas] = useState("");
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [vagasEmpresa, setVagasEmpresa] = useState([]);
    const [carregandoVagas, setCarregandoVagas] = useState(false);
    const [erroVagas, setErroVagas] = useState("");
    const [relatorioCandidaturas, setRelatorioCandidaturas] = useState([]);
    const [carregandoRelatorio, setCarregandoRelatorio] = useState(true);
    const [erroRelatorio, setErroRelatorio] = useState("");
    const [buscaEmpresa, setBuscaEmpresa] = useState("");


    useEffect(() => {
        if (carregandoAuth || !ehAdmin) return;

        async function carregarUsuarios() {
            setCarregandoUsuarios(true);
            setErroUsuarios("");

            try {
                const dados = await api("/admin/usuarios");
                setUsuarios(dados);
            } catch (erro) {
                setErroUsuarios("Erro ao carregar usuários. Verifique a conexão com o servidor.");
                setUsuarios([]);
            } finally {
                setCarregandoUsuarios(false);
            }
        }


        carregarUsuarios();
    }, [carregandoAuth, ehAdmin]);

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
        if (carregandoAuth || !ehAdmin) return;

        async function carregarRelatorioCandidaturas() {
            setCarregandoRelatorio(true);
            setErroRelatorio("");

            try {
                const dados = await api("/admin/relatorios/candidaturas");
                setRelatorioCandidaturas(dados);
            } catch (erro) {
                setErroRelatorio("Erro ao carregar relatório. Verifique a conexão com o servidor.");
                setRelatorioCandidaturas([]);
            } finally {
                setCarregandoRelatorio(false);
            }
        }

        carregarRelatorioCandidaturas();
    }, [carregandoAuth, ehAdmin]);


    useEffect(() => {
        if (carregandoAuth || !ehAdmin) return;

        async function carregarEmpresas() {
            setCarregandoEmpresas(true);
            setErroEmpresas("");

            try {
                const dados = await api("/admin/empresas");
                setEmpresas(dados);
            } catch (erro) {
                setErroEmpresas(
                    "Erro ao carregar empresas. Verifique a conexão com o servidor."
                );
                setEmpresas([]);
            } finally {
                setCarregandoEmpresas(false);
            }
        }


        carregarEmpresas();
    }, [carregandoAuth, ehAdmin]);

    const [resumo, setResumo] = useState({
        candidatos: 0,
        empresas: 0,
        vagasAbertas: 0,
        totalCandidaturas: 0,
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");


    useEffect(() => {
        if (carregandoAuth || !ehAdmin) return;
        async function carregarResumo() {
            try {
                const dados = await api("/admin/resumo");
                setResumo(dados);
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarResumo();
    }, [carregandoAuth, ehAdmin]);

    useEffect(() => {
        if (carregandoAuth || !ehAdmin) return;
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
                const dados = await api(
                    `/admin/empresas/${empresaSelecionada.id}/vagas`
                );


                setVagasEmpresa(dados);
            } catch (erro) {
                setErroVagas(erro.message);
            } finally {
                setCarregandoVagas(false);
            }
        }

        carregarVagas();
    }, [empresaSelecionada, carregandoAuth, ehAdmin]);


    async function alterarSituacao(usuarioAlvo) {
        if (processandoUsuario) return;

        setProcessandoUsuario(true);
        setErroGerenciamento("");

        try {
            const novoStatus = !Boolean(usuarioAlvo.ativo);

            await api(`/admin/usuarios/${usuarioAlvo.id}/situacao`, {
                metodo: "PATCH",
                corpo: { ativo: novoStatus }
            });

            setUsuarios((anteriores) =>
                anteriores.map((item) =>
                    item.id === usuarioAlvo.id
                        ? { ...item, ativo: novoStatus ? 1 : 0 }
                        : item
                )
            );

            setUsuarioSelecionado((atual) =>
                atual?.id === usuarioAlvo.id
                    ? { ...atual, ativo: novoStatus ? 1 : 0 }
                    : atual
            );
        } catch (erro) {
            setErroGerenciamento(
                erro.message || "Não foi possível alterar a situação."
            );
        } finally {
            setProcessandoUsuario(false);
        }
    }

    async function excluirConta(usuarioAlvo) {
        if (processandoUsuario) return;

        setProcessandoUsuario(true);
        setErroGerenciamento("");

        try {
            await api(`/admin/usuarios/${usuarioAlvo.id}`, {
                metodo: "DELETE"
            });

            setUsuarios((anteriores) =>
                anteriores.filter((item) => item.id !== usuarioAlvo.id)
            );

            setUsuarioSelecionado(null);
            setConfirmandoExclusao(false);
        } catch (erro) {
            setErroGerenciamento(
                erro.message || "Não foi possível excluir a conta."
            );
        } finally {
            setProcessandoUsuario(false);
        }
    }


    if (carregandoAuth) {
        return <p>Verificando permissões...</p>;
    }

    if (!ehAdmin) {
        return <p>Acesso não autorizado. Redirecionando...</p>;
    }

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
                            {carregando && <p>Carregando indicadores...</p>}

                            {erro && (
                                <p style={{ color: "red" }}>
                                    Erro ao carregar indicadores. Verifique a conexão com o servidor.
                                </p>
                            )}

                            {!carregando && !erro && (
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
                            )}

                            <section className={styles.painel}>
                                <div className={styles.painelHeader}>
                                    <h2>Usuários recentes</h2>
                                    <input
                                        placeholder="Buscar por nome ou e-mail"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                </div>

                                {carregandoUsuarios && <p>Carregando usuários...</p>}
                                {erroUsuarios && <p style={{ color: "red" }}>{erroUsuarios}</p>}

                                {!carregandoUsuarios && !erroUsuarios && (
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
                                                        <td>
                                                            <button type="button" onClick={() => setUsuarioSelecionado(usuario)}>
                                                                Gerenciar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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

                            {carregandoUsuarios && (
                                <p>Carregando usuários...</p>
                            )}

                            {erroUsuarios && (
                                <p style={{ color: "red" }}>{erroUsuarios}</p>
                            )}

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

                                {!carregandoUsuarios &&
                                    !erroUsuarios &&
                                    usuariosFiltrados.length === 0 && (
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

                            {carregandoEmpresas && (
                                <p>Carregando empresas...</p>
                            )}

                            {erroEmpresas && (
                                <p style={{ color: "red" }}>{erroEmpresas}</p>
                            )}

                            {!carregandoEmpresas && !erroEmpresas && (
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
                            )}
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

                                {carregandoRelatorio && <p>Carregando relatório...</p>}

                                {erroRelatorio && (
                                    <p style={{ color: "red" }}>{erroRelatorio}</p>
                                )}

                                <p>
                                    Distribuição das candidaturas registradas
                                    na plataforma.
                                </p>

                                <div style={{ marginTop: "25px" }}>
                                    {carregandoRelatorio || erroRelatorio ? null : relatorioCandidaturas.length === 0 ? (
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
                    onClick={() => {
                        if (processandoUsuario) return;
                        setUsuarioSelecionado(null);
                        setConfirmandoExclusao(false);
                        setErroGerenciamento("");
                    }}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Gerenciar usuário"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Gerenciar usuário</h2>

                        <p><strong>Nome:</strong> {usuarioSelecionado.nome}</p>
                        <p><strong>E-mail:</strong> {usuarioSelecionado.email}</p>
                        <p><strong>Perfil:</strong> {usuarioSelecionado.perfil}</p>
                        <p>
                            <strong>Situação:</strong>{" "}
                            {usuarioSelecionado.ativo ? "Ativo" : "Bloqueado"}
                        </p>

                        {erroGerenciamento && (
                            <p role="alert" style={{ color: "#dc2626" }}>
                                {erroGerenciamento}
                            </p>
                        )}

                        {usuarioSelecionado.perfil !== "ADMIN" && (
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px",
                                marginTop: "20px"
                            }}>
                                <button
                                    type="button"
                                    disabled={processandoUsuario || confirmandoExclusao}
                                    onClick={() => alterarSituacao(usuarioSelecionado)}
                                >
                                    {usuarioSelecionado.ativo
                                        ? "Bloquear conta"
                                        : "Desbloquear conta"}
                                </button>

                                <button
                                    type="button"
                                    disabled={processandoUsuario}
                                    onClick={() => {
                                        setErroGerenciamento("");
                                        setConfirmandoExclusao(true);
                                    }}
                                    style={{
                                        backgroundColor: "#dc2626",
                                        color: "white"
                                    }}
                                >
                                    Excluir conta
                                </button>
                            </div>
                        )}

                        {confirmandoExclusao && (
                            <div style={{
                                marginTop: "20px",
                                padding: "15px",
                                border: "1px solid #dc2626",
                                borderRadius: "8px"
                            }}>
                                <p>
                                    Tem certeza de que deseja excluir a conta de{" "}
                                    <strong>{usuarioSelecionado.nome}</strong>?
                                </p>
                                <p>
                                    A conta perderá o acesso à plataforma.
                                    Os registros relacionados serão preservados.
                                </p>

                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "12px"
                                }}>
                                    <button
                                        type="button"
                                        disabled={processandoUsuario}
                                        onClick={() => excluirConta(usuarioSelecionado)}
                                        style={{
                                            backgroundColor: "#dc2626",
                                            color: "white"
                                        }}
                                    >
                                        {processandoUsuario
                                            ? "Excluindo..."
                                            : "Confirmar exclusão"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={processandoUsuario}
                                        onClick={() => setConfirmandoExclusao(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className={styles.modalFechar}
                            disabled={processandoUsuario}
                            onClick={() => {
                                setUsuarioSelecionado(null);
                                setConfirmandoExclusao(false);
                                setErroGerenciamento("");
                            }}
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