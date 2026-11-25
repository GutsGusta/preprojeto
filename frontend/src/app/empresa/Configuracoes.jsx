"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_lib/AuthContext";
import { authApi } from "../_lib/servicos";
import "../candidato/configuracoes.css";
import CampoSenha from "../_components/CampoSenha";
import { ESTADOS } from '../_lib/estados';

export default function Configuracoes() {
    const { usuario, atualizarUsuario } = useAuth();

    const [dados, setDados] = useState({
        nomeFantasia: usuario?.empresaNome || "",
        razaoSocial: usuario?.razaoSocial || "",
        setor: usuario?.setor || "",
        site: usuario?.site || "",
        descricao: usuario?.descricao || "",
        cidade: usuario?.cidade || "",
        uf: usuario?.uf || "",
    });

    const [foto, setFoto] = useState(null);
    const [previaFoto, setPreviaFoto] = useState(null);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);

    const [mensagemPerfil, setMensagemPerfil] = useState("");
    const [mensagemSenha, setMensagemSenha] = useState("");

    const podeEditar = usuario?.adminEmpresa === true;

    useEffect(() => {
        if (usuario) {
            setDados({
                nomeFantasia: usuario.empresaNome || "",
                razaoSocial: usuario.razaoSocial || "",
                setor: usuario.setor || "",
                site: usuario.site || "",
                descricao: usuario.descricao || "",
                cidade: usuario.cidade || "",
                uf: usuario.uf || "",
            });
        }
    }, [usuario]);

    useEffect(() => {
        if (!foto) {
            setPreviaFoto(null);
            return;
        }

        const endereco = URL.createObjectURL(foto);
        setPreviaFoto(endereco);

        return () => URL.revokeObjectURL(endereco);
    }, [foto]);

    function alterarCampo(campo, valor) {
        setDados(anterior => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    function converterFotoBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();

            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = () => reject(
                new Error("Erro ao ler a imagem.")
            );

            leitor.readAsDataURL(arquivo);
        });
    }

    function selecionarFoto(evento) {
        const arquivo = evento.target.files?.[0];

        if (!arquivo) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
            alert("Selecione uma imagem JPG, PNG ou WebP.");
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 2 MB.");
            return;
        }

        setFoto(arquivo);
    }

    async function removerFoto() {
        if (!window.confirm("Deseja remover esta imagem?")) {
            return;
        }

        setSalvandoPerfil(true);
        setMensagemPerfil("");

        try {
            await authApi.atualizarPerfil({
                removerFoto: true
            });

            atualizarUsuario({ fotoUrl: null });
            setFoto(null);
            setMensagemPerfil("Imagem removida com sucesso!");

        } catch (erro) {
            setMensagemPerfil(
                erro.message || "Erro ao remover imagem."
            );
        } finally {
            setSalvandoPerfil(false);
        }
    }

    async function salvarPerfil() {
        if (!podeEditar) return;

        setMensagemPerfil("");
        setSalvandoPerfil(true);

        try {
            const payload = { ...dados };

            if (foto) {
                payload.foto = await converterFotoBase64(foto);
            }

            const resposta = await authApi.atualizarPerfil(payload);

            atualizarUsuario({
                empresaNome: resposta.empresaNome,
                razaoSocial: resposta.razaoSocial,
                setor: resposta.setor,
                site: resposta.site,
                descricao: resposta.descricao,
                cidade: resposta.cidade,
                uf: resposta.uf,
                ...(resposta.fotoUrl
                    ? { fotoUrl: resposta.fotoUrl }
                    : {}),
            });

            setFoto(null);
            setMensagemPerfil("Informações atualizadas com sucesso!");

        } catch (erro) {
            setMensagemPerfil(
                erro.message || "Erro ao atualizar a empresa."
            );
        } finally {
            setSalvandoPerfil(false);
        }
    }

    async function salvarSenha() {
        setMensagemSenha("");

        if (novaSenha !== confirmarSenha) {
            setMensagemSenha("As senhas não coincidem.");
            return;
        }

        if (novaSenha.length < 8) {
            setMensagemSenha(
                "A nova senha deve ter pelo menos 8 caracteres."
            );
            return;
        }

        setSalvandoSenha(true);

        try {
            await authApi.alterarSenha(senhaAtual, novaSenha);

            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");

            setMensagemSenha("Senha alterada com sucesso!");

        } catch (erro) {
            setMensagemSenha(
                erro.message || "Erro ao alterar senha."
            );
        } finally {
            setSalvandoSenha(false);
        }
    }

    const campos = [
        { nome: "nomeFantasia", label: "Nome fantasia" },
        { nome: "razaoSocial", label: "Razão social" },
        { nome: "setor", label: "Setor" },
        { nome: "site", label: "Site" },
        { nome: "cidade", label: "Cidade" },
        { nome: "uf", label: "UF", maxLength: 2 },
    ];

    return (
        <div className="configuracoes-candidato">

            <section>
                <h2>Informações da empresa</h2>

                {!podeEditar && (
                    <p>
                        Somente administradores podem alterar
                        os dados da empresa.
                    </p>
                )}

                <div className="foto-configuracao">

                    <div className="foto-configuracao-avatar">

                        {previaFoto || usuario?.fotoUrl ? (
                            <img
                                src={previaFoto || usuario.fotoUrl}
                                alt="Logotipo da empresa"
                            />
                        ) : (
                            <span>
                                {dados.nomeFantasia
                                    .trim()
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map(palavra => palavra[0])
                                    .join("")
                                    .toUpperCase()}
                            </span>
                        )}

                    </div>

                    <div className="foto-configuracao-info">

                        <h3>Logotipo da empresa</h3>

                        <p>Personalize a identidade da sua empresa.</p>

                        {podeEditar && (
                            <>
                                <label
                                    htmlFor="logo-empresa"
                                    className="btn-trocar-foto"
                                >
                                    {usuario?.fotoUrl
                                        ? "Trocar logotipo"
                                        : "Adicionar logotipo"}
                                </label>

                                <input
                                    id="logo-empresa"
                                    type="file"
                                    className="input-foto-oculto"
                                    accept="image/png,image/jpeg,image/webp"
                                    disabled={salvandoPerfil}
                                    onChange={evento => {
                                        selecionarFoto(evento);
                                        evento.target.value = "";
                                    }}
                                />

                                {podeEditar && usuario?.fotoUrl && (
                                    <button
                                        type="button"
                                        className="btn-remover-imagem"
                                        onClick={removerFoto}
                                        disabled={salvandoPerfil}
                                    >
                                        Remover logotipo
                                    </button>
                                )}

                                <small>
                                    JPG, PNG ou WebP. Máximo de 2 MB.
                                </small>
                            </>
                        )}

                        {foto && (
                            <>
                                <p className="foto-pendente">
                                    Novo logotipo selecionado.
                                    Salve as alterações.
                                </p>

                                <button
                                    type="button"
                                    className="btn-cancelar-foto"
                                    disabled={salvandoPerfil}
                                    onClick={() => setFoto(null)}
                                >
                                    Cancelar seleção
                                </button>
                            </>
                        )}

                    </div>
                </div>

                {campos.map(campo => (
                    <div key={campo.nome}>

                        <label htmlFor={campo.nome}>
                            {campo.label}
                        </label>

                        {campo.nome === "uf" ? (
                            <select
                                id={campo.nome}
                                value={dados.uf}
                                disabled={!podeEditar || salvandoPerfil}
                                onChange={e => alterarCampo("uf", e.target.value)}
                            >
                                <option value="">Selecione</option>

                                {ESTADOS.map(uf => (
                                    <option key={uf} value={uf}>
                                        {uf}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                id={campo.nome}
                                type="text"
                                value={dados[campo.nome]}
                                maxLength={campo.maxLength}
                                disabled={!podeEditar || salvandoPerfil}
                                onChange={e =>
                                    alterarCampo(campo.nome, e.target.value)
                                }
                            />
                        )}

                    </div>
                ))}

                <div>
                    <label htmlFor="cnpj-empresa">CNPJ</label>

                    <input
                        id="cnpj-empresa"
                        type="text"
                        value={usuario?.cnpj || ""}
                        disabled
                    />

                    <small>
                        O CNPJ não pode ser alterado.
                    </small>
                </div>

                <div>
                    <label htmlFor="descricao-empresa">
                        Descrição da empresa
                    </label>

                    <textarea
                        id="descricao-empresa"
                        rows={5}
                        value={dados.descricao}
                        disabled={!podeEditar || salvandoPerfil}
                        onChange={e =>
                            alterarCampo("descricao", e.target.value)
                        }
                        placeholder="Conte um pouco sobre sua empresa..."
                    />
                </div>

                {podeEditar && (
                    <button
                        type="button"
                        onClick={salvarPerfil}
                        disabled={salvandoPerfil}
                    >
                        {salvandoPerfil
                            ? "Salvando..."
                            : "Salvar alterações"}
                    </button>
                )}

                {mensagemPerfil && (
                    <p role="status">{mensagemPerfil}</p>
                )}

            </section>

            <section>

                <h2>Segurança da conta</h2>

                <p>
                    Para alterar sua senha, informe primeiro
                    a senha atual.
                </p>

                <div>
                    <label htmlFor="senha-atual">Senha atual</label>

                    <CampoSenha
                        id="senha-atual"
                        value={senhaAtual}
                        onChange={e => setSenhaAtual(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="nova-senha">Nova senha</label>

                    <input
                        id="nova-senha"
                        type="password"
                        value={novaSenha}
                        onChange={e => setNovaSenha(e.target.value)}
                        minLength={8}
                    />
                </div>

                <div>
                    <label htmlFor="confirmar-senha">
                        Confirmar nova senha
                    </label>

                    <input
                        id="confirmar-senha"
                        type="password"
                        value={confirmarSenha}
                        onChange={e => setConfirmarSenha(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    onClick={salvarSenha}
                    disabled={salvandoSenha}
                >
                    {salvandoSenha
                        ? "Alterando..."
                        : "Alterar senha"}
                </button>

                {mensagemSenha && (
                    <p role="status">{mensagemSenha}</p>
                )}

            </section>

        </div>
    );
}