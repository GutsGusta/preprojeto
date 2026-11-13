"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { entrar, sair } = useAuth();
  const [activeTab, setActiveTab] = useState('candidato');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviarLogin(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const usuario = await entrar(email, senha);

      const perfilDaAba = activeTab === 'empresa' ? 'RECRUTADOR' : 'CANDIDATO';
      if (usuario.perfil !== 'ADMIN' && usuario.perfil !== perfilDaAba) {
        sair();
        throw new Error(
          usuario.perfil === 'RECRUTADOR'
            ? 'Esta conta é de empresa. Use a aba Empresa.'
            : 'Esta conta é de candidato. Use a aba Candidato.'
        );
      }

      const voltar = new URLSearchParams(window.location.search).get('voltar');
      if (voltar && voltar.startsWith('/') && !voltar.startsWith('//')) {
        router.push(voltar);
      } else if (usuario.perfil === 'ADMIN') {
        router.push('/admin');
      } else if (usuario.perfil === 'RECRUTADOR') {
        router.push('/empresa/vagas');
      } else {
        router.push('/');
      }
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
            Sua próxima vaga<br />começa aqui
          </h2>
          <p>
            Candidatos acompanham cada etapa. Empresas organizam o processo seletivo do início ao fim.
          </p>
        </div>
      </div>

      <div className="conteudo-principal">
        <div className="caixa-login">

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
            {activeTab === 'candidato' ? 'Entrar como Candidato' : 'Entrar como Empresa'}
          </h3>

          <form onSubmit={enviarLogin}>
            {erro && <p className="mensagem-erro">{erro}</p>}

            <div className="grupo-campo">
              <label>{activeTab === 'empresa' ? 'E-mail corporativo' : 'E-mail'}</label>
              <input
                type="email"
                placeholder={activeTab === 'empresa' ? 'empresa@dominio.com' : 'voce@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grupo-campo">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Mínimo de 8 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="link-conta">
            Ainda não tem conta? <a href="/cadastro">Cadastre-se</a>
          </div>

        </div>
      </div>
    </div>
  );
}
