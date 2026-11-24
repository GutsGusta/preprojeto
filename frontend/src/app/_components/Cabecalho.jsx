'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import { iniciais } from '../_lib/formatar';

function ItemMenu({ href, children }) {
  const caminho = usePathname();
  const ativo = caminho === href || caminho.startsWith(`${href}/`);
  return <Link href={href} className={ativo ? 'ativo' : undefined} aria-current={ativo ? 'page' : undefined}>{children}</Link>;
}

export default function Cabecalho() {
  const { usuario, ehRecrutador, ehAdmin, sair } = useAuth();
  const caminho = usePathname();
  if (
    caminho === '/login' ||
    caminho === '/cadastro' ||
    caminho.startsWith('/candidato') ||
    caminho === '/empresa'
  ) return null;

  const painel = ehAdmin
    ? { href: '/admin', texto: 'Administração' }
    : ehRecrutador
    ? { href: '/empresa', texto: 'Meu painel' }
      : { href: '/candidato', texto: 'Meu painel' };

  return (
    <header className="cabecalho">
      <Link href="/" className="jobmatch">JobMatch</Link>
      <nav className="cabecalho-btn">
        <ItemMenu href="/vagas">Vagas</ItemMenu>
        <ItemMenu href="/empresas">Empresas</ItemMenu>
        {!ehRecrutador && <ItemMenu href="/para-empresas">Para empresas</ItemMenu>}
      </nav>
      <div className="btn-login">
        {usuario ? (
          <>
            <Link href={painel.href} className="btn-painel" title={painel.texto}>
              <span className="avatar-painel">
                {usuario.fotoUrl ? (
                  <img
                    src={usuario.fotoUrl}
                    alt="Foto de perfil"
                  />
                ) : (
                  iniciais(usuario.empresaNome || usuario.nome)
                )}
              </span>
              <span className="info-painel">
                <strong>{usuario.empresaNome || usuario.nome}</strong>
                <small>{painel.texto}</small>
              </span>
            </Link>
            <Link href="/" className="entrar" onClick={sair}>Sair</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="entrar">Entrar</Link>
            <Link href="/cadastro" className="cadastrar">Cadastrar</Link>
          </>
        )}
      </div>
    </header>
  );
}