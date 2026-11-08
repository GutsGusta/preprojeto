"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import { authApi } from '../_lib/servicos';
import './cadastro.css';

export default function Cadastro() {
  const router = useRouter();
  const { entrar } = useAuth();
  const [activeTab, setActiveTab] = useState('candidato');
  const [campos, setCampos] = useState({
    email: '', senha: '', cidade: '', uf: '',
    nome: '', cpf: '', dataNascimento: '', telefone: '',
    razaoSocial: '', nomeFantasia: '', cnpj: '', setor: '', site: '',
  });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function mudarCampo(evento) {
    setCampos({ ...campos, [evento.target.name]: evento.target.value });
  }

  async function enviarCadastro(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await authApi.cadastrar({ ...campos, tipo: activeTab });
      const usuario = await entrar(campos.email, campos.senha);
      router.push(usuario.perfil === 'RECRUTADOR' ? '/empresa/vagas' : '/');
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-login">
      <div className="painel-lateral">
        <div>
          <h1>JobMatch</h1>
          <h2>
            Junte-se a nós<br />e comece agora
          </h2>
          <p>
            Crie a sua conta para encontrar as melhores vagas ou os melhores talentos.
          </p>
        </div>
      </div>

      <div className="conteudo-principal">
        <div className="caixa-login" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          <div className="abas">
            <button
              onClick={() => setActiveTab('candidato')}
              className={activeTab === 'candidato' ? 'ativa' : ''}
            >
              Candidato
            </button>
            <button
              onClick={() => setActiveTab('empresa')}
              className={activeTab === 'empresa' ? 'ativa' : ''}
            >
              Empresa
            </button>
          </div>

          <h3>
            {activeTab === 'candidato' ? 'Cadastro de Candidato' : 'Cadastro de Empresa'}
          </h3>

          <form onSubmit={enviarCadastro}>
            {erro && <p className="mensagem-erro">{erro}</p>}

            <div className="grupo-campo">
              <label>E-mail</label>
              <input type="email" name="email" placeholder="voce@email.com" value={campos.email} onChange={mudarCampo} required />
            </div>

            <div className="grupo-campo">
              <label>Senha</label>
              <input type="password" name="senha" placeholder="Crie uma senha forte" minLength={8} value={campos.senha} onChange={mudarCampo} required />
            </div>

            {activeTab === 'candidato' ? (
              <>
                <div className="grupo-campo">
                  <label>Nome Completo</label>
                  <input type="text" name="nome" placeholder="Seu nome completo" value={campos.nome} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>CPF</label>
                  <input type="text" name="cpf" placeholder="000.000.000-00" value={campos.cpf} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>Data de Nascimento</label>
                  <input type="date" name="dataNascimento" value={campos.dataNascimento} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>Telefone</label>
                  <input type="text" name="telefone" placeholder="(00) 00000-0000" value={campos.telefone} onChange={mudarCampo} required />
                </div>
              </>
            ) : (
              <>
                <div className="grupo-campo">
                  <label>Razão Social</label>
                  <input type="text" name="razaoSocial" placeholder="Razão Social da Empresa" value={campos.razaoSocial} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>Nome Fantasia</label>
                  <input type="text" name="nomeFantasia" placeholder="Nome Fantasia" value={campos.nomeFantasia} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>CNPJ</label>
                  <input type="text" name="cnpj" placeholder="00.000.000/0000-00" value={campos.cnpj} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>Setor</label>
                  <input type="text" name="setor" placeholder="Ex: Tecnologia, Saúde..." value={campos.setor} onChange={mudarCampo} required />
                </div>
                <div className="grupo-campo">
                  <label>Site</label>
                  <input type="url" name="site" placeholder="https://www.suaempresa.com" value={campos.site} onChange={mudarCampo} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="grupo-campo" style={{ flex: 2 }}>
                <label>Cidade</label>
                <input type="text" name="cidade" placeholder="Sua cidade" value={campos.cidade} onChange={mudarCampo} required />
              </div>
              <div className="grupo-campo" style={{ flex: 1 }}>
                <label>UF</label>
                <input type="text" name="uf" placeholder="Ex: SP" maxLength="2" value={campos.uf} onChange={mudarCampo} required />
              </div>
            </div>

            <button type="submit" style={{ marginTop: '1rem' }} disabled={enviando}>
              {enviando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="link-conta">
            Já tem uma conta? <a href="/login">Entrar</a>
          </div>

        </div>
      </div>
    </div>
  );
}
