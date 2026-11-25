"use client";

import React, { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import { authApi } from '../_lib/servicos';
import { IconeCamera } from '../_components/Icones';
import CampoSenha from '../_components/CampoSenha';
import {
  mascaraTelefone,
  mascaraCPF,
  mascaraCNPJ
} from '../_lib/mascaras';
import { ESTADOS } from '../_lib/estados';
import './cadastro.css';

export default function PaginaCadastro() {
  return (
    <Suspense>
      <Cadastro />
    </Suspense>
  );
}

function Cadastro() {
  const router = useRouter();
  const parametros = useSearchParams();
  const { entrar } = useAuth();
  const [activeTab, setActiveTab] = useState(parametros.get('tipo') === 'empresa' ? 'empresa' : 'candidato');
  const [campos, setCampos] = useState({
    email: '', senha: '', cidade: '', uf: '',
    nome: '', cpf: '', dataNascimento: '', telefone: '',
    razaoSocial: '', nomeFantasia: '', cnpj: '', setor: '', site: '',
  });
  const [foto, setFoto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const campoFoto = useRef(null);

  function mudarCampo(evento) {
    const { name, value } = evento.target;

    let valor = value;

    if (name === "telefone") {
      valor = mascaraTelefone(value);
    }

    if (name === "cpf") {
      valor = mascaraCPF(value);
    }

    if (name === "cnpj") {
      valor = mascaraCNPJ(value);
    }

    if (name === "uf") {
      valor = value.replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .slice(0, 2);
    }

    setCampos(anterior => ({
      ...anterior,
      [name]: valor
    }));
  }

  function trocarAba(tipo) {
    setActiveTab(tipo);
    setFoto('');
    setErro('');
  }

  function escolherFoto(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = '';
    if (!arquivo) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      setErro('A foto precisa ser uma imagem JPG, PNG ou WebP.');
      return;
    }

    setErro('');
    const endereco = URL.createObjectURL(arquivo);
    const imagem = new Image();
    imagem.onload = () => {
      const escala = Math.min(1, 400 / Math.max(imagem.width, imagem.height));
      const tela = document.createElement('canvas');
      tela.width = Math.round(imagem.width * escala);
      tela.height = Math.round(imagem.height * escala);
      const desenho = tela.getContext('2d');
      desenho.fillStyle = '#ffffff';
      desenho.fillRect(0, 0, tela.width, tela.height);
      desenho.drawImage(imagem, 0, 0, tela.width, tela.height);
      setFoto(tela.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(endereco);
    };
    imagem.onerror = () => {
      setErro('Não foi possível ler essa imagem.');
      URL.revokeObjectURL(endereco);
    };
    imagem.src = endereco;
  }

  async function enviarCadastro(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await authApi.cadastrar({ ...campos, tipo: activeTab, foto });
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
          <Link className="jobmatch" href="/">JobMatch</Link>
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
              onClick={() => trocarAba('candidato')}
              className={activeTab === 'candidato' ? 'ativa' : ''}
            >
              Candidato
            </button>
            <button
              onClick={() => trocarAba('empresa')}
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

            <div className="grupo-foto">
              <div className="previa-foto">
                {foto ? <img src={foto} alt="Prévia da foto escolhida" /> : <IconeCamera />}
              </div>
              <div className="acoes-foto">
                <input
                  ref={campoFoto}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={escolherFoto}
                  hidden
                />
                <div className="botoes-foto">
                  <button type="button" className="btn-adicionar-foto" onClick={() => campoFoto.current.click()}>
                    {foto ? 'Trocar foto' : activeTab === 'candidato' ? 'Adicionar foto' : 'Adicionar logo'}
                  </button>
                  {foto && (
                    <button type="button" className="btn-remover-foto" onClick={() => setFoto('')}>
                      Remover
                    </button>
                  )}
                </div>
                <span className="dica-foto">Opcional · JPG, PNG ou WebP</span>
              </div>
            </div>

            <div className="grupo-campo">
              <label>E-mail</label>
              <input type="email" name="email" placeholder="voce@email.com" value={campos.email} onChange={mudarCampo} required />
            </div>

            <div className="grupo-campo">
              <label htmlFor="senha-cadastro">Senha</label>
              <CampoSenha
                id="senha-cadastro"
                name="senha"
                placeholder="Crie uma senha forte"
                minLength={8}
                value={campos.senha}
                onChange={mudarCampo}
                autoComplete="new-password"
                required
              />
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
                <select
                  name="uf"
                  value={campos.uf}
                  onChange={mudarCampo}
                  required
                >
                  <option value="">Selecione</option>

                  {ESTADOS.map(uf => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
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
