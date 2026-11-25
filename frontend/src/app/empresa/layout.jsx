'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RotaProtegida from '../_components/RotaProtegida';
import { useAuth } from '../_lib/AuthContext';
import { iniciais } from '../_lib/formatar';
import '../candidato/candidato.css';
import './empresa.css';

function EstruturaEmpresa({ children }) {
    const { usuario, sair } = useAuth();
    const caminho = usePathname();

    const nomeEmpresa = usuario.empresaNome || usuario.nome;

    return (
        <div className="container-candidato dashboard-empresa">

            <header className="cabecalho-candidato">

                <Link href="/" className="logo-candidato">
                    JobMatch
                </Link>

                <div className="usuario-candidato">

                    <span className="avatar-candidato">
                        {usuario.fotoUrl ? (
                            <img
                                src={usuario.fotoUrl}
                                alt="Logotipo da empresa"
                            />
                        ) : (
                            iniciais(nomeEmpresa)
                        )}
                    </span>

                    <span>{nomeEmpresa}</span>

                    <Link
                        href="/"
                        className="btn-sair"
                        onClick={sair}
                    >
                        Sair
                    </Link>

                </div>

            </header>

            <div className="layout-candidato">

                <aside className="barra-lateral">

                    <Link
                        href="/empresa"
                        className={
                            caminho === '/empresa' ? 'ativo' : ''
                        }
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/empresa/vagas"
                        className={
                            caminho.startsWith('/empresa/vagas')
                                ? 'ativo'
                                : ''
                        }
                    >
                        Minhas vagas
                    </Link>

                    <Link
                        href="/empresa/configuracoes"
                        className={
                            caminho.startsWith('/empresa/configuracoes')
                                ? 'ativo'
                                : ''
                        }
                    >
                        Configurações
                    </Link>

                </aside>

                <div className="principal-candidato">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default function EmpresaLayout({ children }) {
    return (
        <RotaProtegida perfis={['RECRUTADOR']}>
            <EstruturaEmpresa>
                {children}
            </EstruturaEmpresa>
        </RotaProtegida>
    );
}