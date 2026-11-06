"use client";

import React, { useState } from 'react';
import './cadastro.css'; 

export default function Cadastro() {
  const [activeTab, setActiveTab] = useState('candidato');

  return (
    <div className="login-page">
      <div className="sidebar">
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

      <div className="main-content">
        <div className="login-box" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          
          <div className="tabs">
            <button 
              onClick={() => setActiveTab('candidato')}
              className={activeTab === 'candidato' ? 'active' : ''}
            >
              Candidato
            </button>
            <button 
              onClick={() => setActiveTab('empresa')}
              className={activeTab === 'empresa' ? 'active' : ''}
            >
              Empresa
            </button>
          </div>

          <h3>
            {activeTab === 'candidato' ? 'Cadastro de Candidato' : 'Cadastro de Empresa'}
          </h3>

          <form>
            <div className="input-group">
              <label>E-mail</label>
              <input type="email" placeholder="voce@email.com" required />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input type="password" placeholder="Crie uma senha forte" required />
            </div>

            {activeTab === 'candidato' ? (
              <>
                <div className="input-group">
                  <label>Nome Completo</label>
                  <input type="text" placeholder="Seu nome completo" required />
                </div>
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" placeholder="000.000.000-00" required />
                </div>
                <div className="input-group">
                  <label>Data de Nascimento</label>
                  <input type="date" required />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" placeholder="(00) 00000-0000" required />
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>Razão Social</label>
                  <input type="text" placeholder="Razão Social da Empresa" required />
                </div>
                <div className="input-group">
                  <label>Nome Fantasia</label>
                  <input type="text" placeholder="Nome Fantasia" required />
                </div>
                <div className="input-group">
                  <label>CNPJ</label>
                  <input type="text" placeholder="00.000.000/0000-00" required />
                </div>
                <div className="input-group">
                  <label>Setor</label>
                  <input type="text" placeholder="Ex: Tecnologia, Saúde..." required />
                </div>
                <div className="input-group">
                  <label>Site</label>
                  <input type="url" placeholder="https://www.suaempresa.com" />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="input-group" style={{ flex: 2 }}>
                <label>Cidade</label>
                <input type="text" placeholder="Sua cidade" required />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>UF</label>
                <input type="text" placeholder="Ex: SP" maxLength="2" required />
              </div>
            </div>

            <button type="submit" style={{ marginTop: '1rem' }}>
              Criar Conta
            </button>
          </form>

          <div className="signup-link">
            Já tem uma conta? <a href="/login">Entrar</a>
          </div>

        </div>
      </div>
    </div>
  );
}