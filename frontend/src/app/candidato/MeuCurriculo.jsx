"use client";

import { useEffect, useState } from "react";
import { candidatoApi } from "../_lib/servicos";

const NIVEIS = { BASICO: "Básico", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado" };
const FORMACAO_VAZIA = { instituicao: "", curso: "", nivel: "", inicio: "", fim: "" };
const EXPERIENCIA_VAZIA = { empresa: "", cargo: "", descricao: "", inicio: "", fim: "", atual: false };

export default function MeuCurriculo({ aoSalvar }) {
    const [cv, setCv] = useState(null);
    const [erro, setErro] = useState("");
    const [erros, setErros] = useState({});
    const [sucesso, setSucesso] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [novaHabilidade, setNovaHabilidade] = useState({ nome: "", nivel: "INTERMEDIARIO" });

    useEffect(() => {
        candidatoApi.curriculo()
            .then((dados) => setCv({ ...dados, pretensaoSalarial: dados.pretensaoSalarial ?? "" }))
            .catch(() => setErro("Erro ao carregar o currículo. Verifique a conexão com o servidor."));
    }, []);

    if (!cv) return erro ? <p className="erro-candidato">{erro}</p> : <p>Carregando currículo...</p>;

    function mudarDados(evento) {
        setCv({ ...cv, dados: { ...cv.dados, [evento.target.name]: evento.target.value } });
    }

    function mudarItem(lista, indice, campo, valor) {
        setCv({ ...cv, [lista]: cv[lista].map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)) });
    }

    function adicionarItem(lista, vazio) {
        setCv({ ...cv, [lista]: [...cv[lista], { ...vazio }] });
    }

    function removerItem(lista, indice) {
        setCv({ ...cv, [lista]: cv[lista].filter((_, i) => i !== indice) });
    }

    function adicionarHabilidade(evento) {
        evento.preventDefault();
        const nome = novaHabilidade.nome.trim();
        if (!nome || cv.habilidades.some((h) => h.nome.toLowerCase() === nome.toLowerCase())) return;
        setCv({ ...cv, habilidades: [...cv.habilidades, { nome, nivel: novaHabilidade.nivel }] });
        setNovaHabilidade({ ...novaHabilidade, nome: "" });
    }

    async function salvar(evento) {
        evento.preventDefault();
        setErro("");
        setErros({});
        setSucesso("");
        setSalvando(true);
        try {
            const salvo = await candidatoApi.salvarCurriculo(cv);
            setCv({ ...salvo, pretensaoSalarial: salvo.pretensaoSalarial ?? "" });
            setSucesso("Currículo salvo com sucesso!");
            aoSalvar?.();
        } catch (falha) {
            setErro(falha.message);
            setErros(falha.detalhes || {});
        } finally {
            setSalvando(false);
        }
    }

    return (
        <form className="form-curriculo" onSubmit={salvar} noValidate>
            <section className="painel-candidato progresso-curriculo">
                <div>
                    <h3>Seu currículo está {cv.percentual}% preenchido</h3>
                    <p>Com pelo menos 70% você já pode se candidatar às vagas.</p>
                </div>
                <div className="barra-progresso">
                    <div className="preenchimento" style={{ width: `${cv.percentual}%` }} />
                </div>
            </section>

            <section className="painel-candidato">
                <h3>Dados pessoais</h3>
                <div className="grade-campos">
                    <label className="campo-candidato">Nome completo
                        <input name="nome" value={cv.dados.nome} onChange={mudarDados} />
                        {erros.nome && <span className="erro-candidato">{erros.nome}</span>}
                    </label>
                    <label className="campo-candidato">E-mail
                        <input value={cv.dados.email} disabled />
                    </label>
                    <label className="campo-candidato">Telefone
                        <input name="telefone" value={cv.dados.telefone} onChange={mudarDados} placeholder="(11) 99999-9999" />
                    </label>
                    <label className="campo-candidato">Data de nascimento
                        <input type="date" name="dataNascimento" value={cv.dados.dataNascimento} onChange={mudarDados} />
                    </label>
                    <label className="campo-candidato">Cidade
                        <input name="cidade" value={cv.dados.cidade} onChange={mudarDados} />
                    </label>
                    <label className="campo-candidato">UF
                        <input name="uf" maxLength={2} value={cv.dados.uf} onChange={mudarDados} placeholder="SP" />
                        {erros.uf && <span className="erro-candidato">{erros.uf}</span>}
                    </label>
                </div>
            </section>

            <section className="painel-candidato">
                <h3>Sobre você</h3>
                <label className="campo-candidato">Resumo profissional
                    <textarea rows={4} maxLength={3000} value={cv.resumo} onChange={(e) => setCv({ ...cv, resumo: e.target.value })}
                        placeholder="Conte em poucas linhas sua experiência e seus objetivos." />
                </label>
                <label className="campo-candidato campo-curto">Pretensão salarial (R$)
                    <input type="number" min="0" step="100" value={cv.pretensaoSalarial}
                        onChange={(e) => setCv({ ...cv, pretensaoSalarial: e.target.value })} />
                    {erros.pretensaoSalarial && <span className="erro-candidato">{erros.pretensaoSalarial}</span>}
                </label>
            </section>

            <section className="painel-candidato">
                <div className="txt-vagas">
                    <h3>Formação</h3>
                    <button type="button" className="btn-adicionar" onClick={() => adicionarItem("formacoes", FORMACAO_VAZIA)}>+ Adicionar</button>
                </div>
                {erros.formacoes && <p className="erro-candidato">{erros.formacoes}</p>}
                {cv.formacoes.length === 0 && <p className="texto-cinza">Nenhuma formação adicionada.</p>}
                {cv.formacoes.map((f, i) => (
                    <div key={i} className="item-curriculo">
                        <div className="grade-campos">
                            <label className="campo-candidato">Instituição
                                <input value={f.instituicao} onChange={(e) => mudarItem("formacoes", i, "instituicao", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Curso
                                <input value={f.curso} onChange={(e) => mudarItem("formacoes", i, "curso", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Nível
                                <input value={f.nivel || ""} onChange={(e) => mudarItem("formacoes", i, "nivel", e.target.value)} placeholder="Ex.: Graduação" />
                            </label>
                            <label className="campo-candidato">Início
                                <input type="date" value={f.inicio || ""} onChange={(e) => mudarItem("formacoes", i, "inicio", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Conclusão
                                <input type="date" value={f.fim || ""} onChange={(e) => mudarItem("formacoes", i, "fim", e.target.value)} />
                            </label>
                        </div>
                        <button type="button" className="btn-remover" onClick={() => removerItem("formacoes", i)}>Remover</button>
                    </div>
                ))}
            </section>

            <section className="painel-candidato">
                <div className="txt-vagas">
                    <h3>Experiência</h3>
                    <button type="button" className="btn-adicionar" onClick={() => adicionarItem("experiencias", EXPERIENCIA_VAZIA)}>+ Adicionar</button>
                </div>
                {erros.experiencias && <p className="erro-candidato">{erros.experiencias}</p>}
                {cv.experiencias.length === 0 && <p className="texto-cinza">Nenhuma experiência adicionada.</p>}
                {cv.experiencias.map((x, i) => (
                    <div key={i} className="item-curriculo">
                        <div className="grade-campos">
                            <label className="campo-candidato">Empresa
                                <input value={x.empresa} onChange={(e) => mudarItem("experiencias", i, "empresa", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Cargo
                                <input value={x.cargo} onChange={(e) => mudarItem("experiencias", i, "cargo", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Início
                                <input type="date" value={x.inicio || ""} onChange={(e) => mudarItem("experiencias", i, "inicio", e.target.value)} />
                            </label>
                            <label className="campo-candidato">Saída
                                <input type="date" value={x.fim || ""} disabled={x.atual} onChange={(e) => mudarItem("experiencias", i, "fim", e.target.value)} />
                            </label>
                        </div>
                        <label className="campo-candidato">Atividades
                            <textarea rows={2} value={x.descricao || ""} onChange={(e) => mudarItem("experiencias", i, "descricao", e.target.value)} />
                        </label>
                        <div className="txt-vagas">
                            <label className="check-candidato">
                                <input type="checkbox" checked={x.atual} onChange={(e) => mudarItem("experiencias", i, "atual", e.target.checked)} />
                                Trabalho aqui atualmente
                            </label>
                            <button type="button" className="btn-remover" onClick={() => removerItem("experiencias", i)}>Remover</button>
                        </div>
                    </div>
                ))}
            </section>

            <section className="painel-candidato">
                <h3>Habilidades</h3>
                <div className="nova-habilidade">
                    <input value={novaHabilidade.nome} placeholder="Ex.: React"
                        onChange={(e) => setNovaHabilidade({ ...novaHabilidade, nome: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && adicionarHabilidade(e)} />
                    <select value={novaHabilidade.nivel} onChange={(e) => setNovaHabilidade({ ...novaHabilidade, nivel: e.target.value })}>
                        {Object.entries(NIVEIS).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
                    </select>
                    <button type="button" className="btn-adicionar" onClick={adicionarHabilidade}>Adicionar</button>
                </div>
                {erros.habilidades && <p className="erro-candidato">{erros.habilidades}</p>}
                <ul className="lista-habilidades">
                    {cv.habilidades.map((h, i) => (
                        <li key={h.nome}>
                            {h.nome} <small>{NIVEIS[h.nivel] || ""}</small>
                            <button type="button" aria-label={`Remover ${h.nome}`} onClick={() => removerItem("habilidades", i)}>×</button>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="acoes-curriculo">
                {erro && <span className="erro-candidato">{erro}</span>}
                {sucesso && <span className="sucesso-candidato">{sucesso}</span>}
                <button type="submit" className="btn-salvar" disabled={salvando}>{salvando ? "Salvando..." : "Salvar currículo"}</button>
            </div>
        </form>
    );
}
