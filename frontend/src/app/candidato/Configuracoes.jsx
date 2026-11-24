
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_lib/AuthContext";
import "./configuracoes.css";
import { authApi } from "../_lib/servicos";

export default function Configuracoes() {
    const { usuario, atualizarUsuario } = useAuth();

    const [nome, setNome] = useState(usuario?.nome || "");
    const [telefone, setTelefone] = useState(usuario?.telefone || "");
    const [foto, setFoto] = useState(null);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);
    const [mensagemPerfil, setMensagemPerfil] = useState("");
    const [mensagemSenha, setMensagemSenha] = useState("");

    useEffect(() => {
        if (usuario) {
          setNome(usuario.nome || "");
          setTelefone(usuario.telefone || "");
        }
      }, [usuario]);

    async function salvarPerfil() {
        setMensagemPerfil("");
        setSalvandoPerfil(true);

        try {
            const resposta = await authApi.atualizarPerfil({
                nome: nome.trim(),
                telefone: telefone.trim(),
            });

            atualizarUsuario({ nome: resposta.nome });
            setMensagemPerfil("Informações atualizadas com sucesso!");
        } catch (erro) {
            setMensagemPerfil(erro.message || "Erro ao atualizar perfil.");
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
            setMensagemSenha("A nova senha deve ter pelo menos 8 caracteres.");
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
            setMensagemSenha(erro.message || "Erro ao alterar senha.");
        } finally {
            setSalvandoSenha(false);
        }
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

    return (
        <div className="configuracoes-candidato">
            <section>
                <h2>Informações pessoais</h2>

                <div>
                    <label htmlFor="foto-perfil">Foto de perfil</label>
                    <input
                        id="foto-perfil"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={selecionarFoto}
                    />
                    {foto && <p>Foto selecionada: {foto.name}</p>}
                </div>

                <div>
                    <label htmlFor="nome-config">Nome completo</label>
                    <input
                        id="nome-config"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="telefone-config">Telefone</label>
                    <input
                        id="telefone-config"
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(11) 99999-9999"
                    />
                </div>

                <button
                    type="button"
                    onClick={salvarPerfil}
                    disabled={salvandoPerfil}
                >
                    {salvandoPerfil ? "Salvando..." : "Salvar alterações"}
                </button>

                {mensagemPerfil && <p role="status">{mensagemPerfil}</p>}
            </section>

            <section>
                <h2>Segurança da conta</h2>
                <p>Para alterar sua senha, informe primeiro a senha atual.</p>

                <div>
                    <label htmlFor="senha-atual">Senha atual</label>
                    <input
                        id="senha-atual"
                        type="password"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="nova-senha">Nova senha</label>
                    <input
                        id="nova-senha"
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        minLength={8}
                    />
                </div>

                <div>
                    <label htmlFor="confirmar-senha">Confirmar nova senha</label>
                    <input
                        id="confirmar-senha"
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    onClick={salvarSenha}
                    disabled={salvandoSenha}
                >
                    {salvandoSenha ? "Alterando..." : "Alterar senha"}
                </button>

                {mensagemSenha && <p role="status">{mensagemSenha}</p>}
            </section>
        </div>
    );
}
