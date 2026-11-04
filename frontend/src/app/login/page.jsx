"use client";

import React, { useState } from 'react';
import './login.css';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('candidato');

  return (
    <div className="login-page">
      <div className="sidebar">
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

      <div className="main-content">
        <div className="login-box">
          
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
            {activeTab === 'candidato' ? 'Entrar como Candidato' : 'Entrar como Empresa'}
          </h3>

          <form>
            <div className="input-group">
              <label>{activeTab === 'empresa' ? 'E-mail corporativo' : 'E-mail'}</label>
              <input 
                type="email" 
                placeholder={activeTab === 'empresa' ? 'empresa@dominio.com' : 'voce@email.com'} 
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input type="password" placeholder="Mínimo de 8 caracteres" />
            </div>

            <button type="submit">Entrar</button>
          </form>

          <div className="signup-link">
            Ainda não tem conta? <a href="#">Cadastre-se</a>
          </div>

        </div>
      </div>
    </div>
  );
}