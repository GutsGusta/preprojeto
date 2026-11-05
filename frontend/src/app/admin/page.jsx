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
        "Vagas denunciadas",
        "Relatórios gerais",
    ];

    const [usuarios, setUsuarios] = useState([]);

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

    const [resumo, setResumo] = useState({
        candidatos: 0,
        empresas: 0,
        vagasAbertas: 0,
        denunciasPendentes: 0,
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
                                    ["Denúncias pendentes", resumo.denunciasPendentes]
                                ].map(([titulo, valor]) => (
                                    <div className={styles.card} key={titulo}>
                                        <p>{titulo}</p>
                                        <h2>{valor}</h2>
                                    </div>
                                ))}
                            </section>

                            <section className={styles.painel}>
                                <h2>Vagas denunciadas</h2>
                                <div className={styles.tableWrapper}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Vaga</th>
                                                <th>Empresa</th>
                                                <th>Motivo</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Desenvolvedor Front-End</td>
                                                <td>Empresa Exemplo</td>
                                                <td>Informações enganosas</td>
                                                <td>
                                                    <button disabled>Ignorar</button>
                                                    <button disabled>Remover vaga</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
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
                                                    <td><button disabled>Gerenciar</button></td>
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
                                    <option value="Candidato">Candidatos</option>
                                    <option value="Recrutador">Recrutadores</option>
                                    <option value="Administrador">Administradores</option>
                                </select>

                                <select
                                    value={filtroSituacao}
                                    onChange={(e) => setFiltroSituacao(e.target.value)}
                                >
                                    <option value="Todos">Todas as situações</option>
                                    <option value="Ativos">Ativos</option>
                                    <option value="Bloqueados">Bloqueados</option>
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
                                                    <button disabled>
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
                    ) : (
                        <section className={styles.painel}>
                            <p>Área de {pagina.toLowerCase()} em desenvolvimento.</p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}