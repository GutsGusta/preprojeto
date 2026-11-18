"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./empresas.css";
import { empresasApi } from "../_lib/servicos";
import { LogoEmpresa } from "../_components/Etiquetas";
import { Aviso, Carregando, EstadoVazio } from "../_components/Estados";

export default function Empresas() {
    const [empresas, setEmpresas] = useState(null);
    const [busca, setBusca] = useState("");
    const [termo, setTermo] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        empresasApi.listar(termo)
            .then((lista) => { setEmpresas(lista); setErro(""); })
            .catch((falha) => setErro(falha.message));
    }, [termo]);

    return (
        <>
            <section className="topo-empresas">
                <div className="container">
                    <h1>Conheça as empresas</h1>
                    <p>Veja quem está contratando no JobMatch e descubra as vagas de cada empresa.</p>
                    <form role="search" className="busca-empresas" onSubmit={(e) => { e.preventDefault(); setTermo(busca.trim()); }}>
                        <label className="sr-only" htmlFor="busca-empresa">Nome, setor ou cidade</label>
                        <input id="busca-empresa" className="input" type="search" placeholder="Nome, setor ou cidade"
                            value={busca} onChange={(e) => setBusca(e.target.value)} />
                        <button type="submit" className="botao">Buscar</button>
                    </form>
                </div>
            </section>

            <div className="container pagina">
                <Aviso>{erro}</Aviso>
                {!empresas && !erro && <Carregando />}
                {empresas?.length === 0 && (
                    <EstadoVazio titulo="Nenhuma empresa encontrada">
                        <p>Tente buscar por outro nome, setor ou cidade.</p>
                    </EstadoVazio>
                )}

                <div className="grade-empresas">
                    {empresas?.map((empresa) => (
                        <Link key={empresa.id} href={`/empresas/${empresa.id}`} className="card-empresa">
                            <div className="topo-card-empresa">
                                <LogoEmpresa empresa={empresa} />
                                <div>
                                    <h3>{empresa.nome}</h3>
                                    <p className="texto-2 pequeno">
                                        {[empresa.setor, [empresa.cidade, empresa.uf].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                            </div>
                            {empresa.descricao && <p className="descricao-empresa">{empresa.descricao}</p>}
                            <span className={`vagas-empresa${empresa.vagasAbertas > 0 ? " com-vagas" : ""}`}>
                                {empresa.vagasAbertas === 0 ? "Nenhuma vaga aberta" : `${empresa.vagasAbertas} vaga${empresa.vagasAbertas > 1 ? "s" : ""} aberta${empresa.vagasAbertas > 1 ? "s" : ""}`}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
