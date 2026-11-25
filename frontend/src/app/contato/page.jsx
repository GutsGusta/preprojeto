'use client';

import { useState } from 'react';
import './contato.css';
import {
    UserRound,
    Building2,
    MessageSquare,
    Mail,
    Phone,
    Clock
} from 'lucide-react';

export default function Contato() {
    const [mensagem, setMensagem] = useState('');

    function enviarMensagem(e) {
        e.preventDefault();

        setMensagem(
            'Formulário preenchido corretamente. O envio de mensagens ainda não está disponível.'
        );
    }

    return (
        <div className="pagina-contato">

            <section className="contato-banner">
                <h1>Entre em contato</h1>
                <p>
                    Estamos aqui para ajudar você.
                    Envie suas dúvidas, sugestões ou feedbacks.
                </p>
            </section>

            <div className="contato-container">

                <section className="contato-informacoes">

                    <h2>Como podemos ajudar?</h2>

                    <p className="contato-descricao">
                        Nossa missão é conectar talentos e
                        oportunidades, proporcionando uma
                        experiência cada vez melhor.
                    </p>

                    <div className="contato-item">
                        <div className="contato-icone"><div className="contato-icone">
                            <UserRound />
                        </div></div>
                        <div>
                            <h3>Suporte ao candidato</h3>
                            <p>
                                Dúvidas sobre vagas, currículos,
                                candidaturas e sua conta.
                            </p>
                        </div>
                    </div>

                    <div className="contato-item">
                        <div className="contato-icone"><div className="contato-icone">
                            <Building2 />
                        </div></div>
                        <div>
                            <h3>Suporte às empresas</h3>
                            <p>
                                Informações sobre publicação de
                                vagas e processos seletivos.
                            </p>
                        </div>
                    </div>

                    <div className="contato-item">
                        <div className="contato-icone"><div className="contato-icone">
                            <MessageSquare />
                        </div></div>
                        <div>
                            <h3>Sugestões e feedbacks</h3>
                            <p>
                                Compartilhe suas ideias para
                                melhorar nossa plataforma.
                            </p>
                        </div>
                    </div>

                    <div className="contato-canais">

                        <h2>Canais de atendimento</h2>

                        <div className="contato-item">
                            <div className="contato-icone"><div className="contato-icone">
                                <Mail />
                            </div></div>
                            <div>
                                <h3>E-mail</h3>
                                <a href="mailto:contato@exemplo.com">
                                    jobmatch@contato.com
                                </a>
                            </div>
                        </div>

                        <div className="contato-item">
                            <div className="contato-icone"><div className="contato-icone">
                                <Phone />
                            </div></div>
                            <div>
                                <h3>Telefone</h3>
                                <a href="tel:+551100000000">
                                    (11) 93056-9806
                                </a>
                            </div>
                        </div>

                        <div className="contato-item">
                            <div className="contato-icone"><div className="contato-icone">
                                <Clock />
                            </div></div>
                            <div>
                                <h3>Horário de atendimento</h3>
                                <p>Segunda a sexta, das 8h às 18h.</p>
                            </div>
                        </div>

                    </div>

                </section>

                <section className="contato-formulario">

                    <h2>Envie sua mensagem</h2>

                    <form onSubmit={enviarMensagem}>

                        <div className="contato-campo">
                            <label htmlFor="contato-nome">
                                Nome completo
                            </label>
                            <input
                                id="contato-nome"
                                type="text"
                                placeholder="Digite seu nome"
                                required
                            />
                        </div>

                        <div className="contato-campo">
                            <label htmlFor="contato-email">
                                E-mail
                            </label>
                            <input
                                id="contato-email"
                                type="email"
                                placeholder="Digite seu e-mail"
                                required
                            />
                        </div>

                        <div className="contato-campo">
                            <label htmlFor="contato-assunto">
                                Assunto
                            </label>
                            <select id="contato-assunto" required>
                                <option value="">
                                    Selecione o assunto
                                </option>
                                <option>Suporte ao candidato</option>
                                <option>Suporte à empresa</option>
                                <option>Problemas técnicos</option>
                                <option>Sugestões e feedbacks</option>
                                <option>Outros assuntos</option>
                            </select>
                        </div>

                        <div className="contato-campo">
                            <label htmlFor="contato-mensagem">
                                Mensagem
                            </label>
                            <textarea
                                id="contato-mensagem"
                                placeholder="Como podemos ajudar?"
                                rows={5}
                                maxLength={2000}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="contato-botao"
                        >
                            Enviar mensagem
                        </button>

                        {mensagem && (
                            <p className="contato-aviso" role="status">
                                {mensagem}
                            </p>
                        )}

                    </form>

                </section>

            </div>

        </div>
    );
}