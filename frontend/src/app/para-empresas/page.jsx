"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./para-empresas.css";
import { homeApi } from "../_lib/servicos";
import { useAuth } from "../_lib/AuthContext";

const BENEFICIOS = [
    {
        icone: "✦",
        titulo: "Match automático",
        texto: "Cada candidato recebe uma nota de compatibilidade com a vaga, calculada pelas habilidades, nível e localização. Você vê primeiro quem mais combina.",
    },
    {
        icone: "▦",
        titulo: "Processo em quadro Kanban",
        texto: "Arraste os candidatos entre as etapas da seleção e enxergue todo o processo de uma vez, sem planilhas nem e-mails perdidos.",
    },
    {
        icone: "☰",
        titulo: "Etapas do seu jeito",
        texto: "Monte a seleção com as etapas que fazem sentido para a sua empresa: triagem, teste, entrevista, proposta e o que mais precisar.",
    },
    {
        icone: "✉",
        titulo: "Candidatos sempre informados",
        texto: "A cada avanço ou reprovação, o candidato é avisado automaticamente com o feedback que você escrever. Menos retrabalho, mais respeito.",
    },
    {
        icone: "◷",
        titulo: "Publicação em minutos",
        texto: "Crie a vaga em três passos, salve como rascunho, publique, pause ou duplique quando quiser.",
    },
    {
        icone: "▤",
        titulo: "Currículos padronizados",
        texto: "Todos os currículos chegam no mesmo formato, com resumo, experiências, formação e habilidades. Comparar fica muito mais fácil.",
    },
];

const PASSOS = [
    { titulo: "Cadastre sua empresa", texto: "Informe CNPJ, nome e setor. Leva menos de dois minutos." },
    { titulo: "Publique sua vaga", texto: "Descreva a vaga, defina as habilidades e as etapas da seleção." },
    { titulo: "Receba candidatos", texto: "Veja o match de cada um e conduza o processo pelo quadro." },
    { titulo: "Contrate", texto: "Escolha o melhor talento e encerre a vaga com um clique." },
];

const PERGUNTAS = [
    { pergunta: "Quanto custa anunciar vagas?", resposta: "Nada. Cadastrar a empresa e publicar vagas no JobMatch é gratuito." },
    { pergunta: "Quantas vagas posso publicar?", resposta: "Quantas precisar. Você pode manter vagas em rascunho, publicadas ou pausadas ao mesmo tempo." },
    { pergunta: "Como o match é calculado?", resposta: "Comparamos as habilidades pedidas na vaga com as do currículo do candidato, além do nível e da cidade." },
];

export default function ParaEmpresas() {
    const { ehRecrutador } = useAuth();
    const [numeros, setNumeros] = useState(null);

    useEffect(() => {
        homeApi.numeros().then(setNumeros).catch(() => {});
    }, []);

    const destino = ehRecrutador ? "/empresa/vagas/nova" : "/cadastro?tipo=empresa";
    const textoBotao = ehRecrutador ? "Publicar uma vaga" : "Cadastrar minha empresa";

    return (
        <div className="para-empresas">
            <section className="hero-empresas">
                <div className="container hero-conteudo">
                    <div className="hero-texto">
                        <span className="selo">Para empresas e recrutadores</span>
                        <h1>Contrate as pessoas certas, <span>sem complicação</span></h1>
                        <p>
                            Publique vagas, receba candidatos já ranqueados por compatibilidade e conduza toda a seleção
                            em um só lugar. Gratuito para sempre.
                        </p>
                        <div className="hero-acoes">
                            <Link href={destino} className="botao grande">{textoBotao}</Link>
                            <a href="#como-funciona" className="botao secundario grande">Como funciona</a>
                        </div>
                    </div>

                    <div className="hero-quadro" aria-hidden="true">
                        <div className="mini-coluna">
                            <strong>Triagem</strong>
                            <div className="mini-card"><span className="mini-avatar">AM</span>Ana M.<em>92%</em></div>
                            <div className="mini-card"><span className="mini-avatar">BS</span>Bruno S.<em>81%</em></div>
                        </div>
                        <div className="mini-coluna">
                            <strong>Entrevista</strong>
                            <div className="mini-card destaque"><span className="mini-avatar">CL</span>Carla L.<em>97%</em></div>
                        </div>
                        <div className="mini-coluna">
                            <strong>Proposta</strong>
                            <div className="mini-vazio">Arraste aqui</div>
                        </div>
                    </div>
                </div>
            </section>

            {numeros && (
                <section className="container numeros-empresas">
                    <div><strong>{numeros.candidatos}</strong><span>candidatos cadastrados</span></div>
                    <div><strong>{numeros.empresas}</strong><span>empresas contratando</span></div>
                    <div><strong>{numeros.vagasAbertas}</strong><span>vagas abertas agora</span></div>
                    <div><strong>{numeros.candidaturas}</strong><span>candidaturas enviadas</span></div>
                </section>
            )}

            <section className="container secao-empresas">
                <h2>Tudo o que você precisa para contratar melhor</h2>
                <p className="subtitulo">Ferramentas simples, pensadas para quem não tem tempo a perder.</p>
                <div className="grade-beneficios">
                    {BENEFICIOS.map((b) => (
                        <article key={b.titulo} className="card-beneficio">
                            <span className="icone-beneficio" aria-hidden="true">{b.icone}</span>
                            <h3>{b.titulo}</h3>
                            <p>{b.texto}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="como-funciona" className="faixa-passos">
                <div className="container secao-empresas">
                    <h2>Como funciona</h2>
                    <p className="subtitulo">Da vaga publicada à contratação em quatro passos.</p>
                    <ol className="lista-passos">
                        {PASSOS.map((p, i) => (
                            <li key={p.titulo}>
                                <span className="numero-passo">{i + 1}</span>
                                <h3>{p.titulo}</h3>
                                <p>{p.texto}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="container secao-empresas">
                <h2>Perguntas frequentes</h2>
                <div className="perguntas">
                    {PERGUNTAS.map((p) => (
                        <details key={p.pergunta}>
                            <summary>{p.pergunta}</summary>
                            <p>{p.resposta}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="container">
                <div className="chamada-final">
                    <h2>Pronto para encontrar seu próximo talento?</h2>
                    <p>Crie sua conta agora e publique a primeira vaga hoje mesmo.</p>
                    <Link href={destino} className="botao grande claro">{textoBotao}</Link>
                </div>
            </section>
        </div>
    );
}
