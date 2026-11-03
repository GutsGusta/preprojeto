"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function AdminDashboard() {
    const [pagina, setPagina] = useState("Visão geral");
    const [busca, setBusca] = useState("");

    const menus = [
        "Visão geral",
        "Usuários",
        "Empresas",
        "Vagas denunciadas",
        "Relatórios gerais",
    ];

    const usuarios = [
        { nome: "Ana Silva", email: "ana@exemplo.com", perfil: "Candidato", ativo: true },
        { nome: "Bruno Costa", email: "bruno@exemplo.com", perfil: "Candidato", ativo: false },
    ];

    const usuariosFiltrados = usuarios.filter((usuario) =>
        `${usuario.nome} ${usuario.email}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

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
                                    ["Candidatos", "3"],
                                    ["Empresas", "2"],
                                    ["Vagas abertas", "5"],
                                    ["Denúncias pendentes", "1"],
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