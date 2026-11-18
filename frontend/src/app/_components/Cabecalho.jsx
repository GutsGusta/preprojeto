'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';

function ItemMenu({ href, children }) {
  const caminho = usePathname();
  const ativo = caminho === href || caminho.startsWith(`${href}/`);
  return <Link href={href} className={ativo ? 'ativo' : undefined} aria-current={ativo ? 'page' : undefined}>{children}</Link>;
}

export default function Cabecalho() {
  const { usuario, ehCandidato, ehRecrutador, ehAdmin, sair } = useAuth();
  const caminho = usePathname();
  if (caminho === '/login' || caminho === '/cadastro' || caminho.startsWith('/candidato')) return null;

  return (
    <header className="cabecalho">
      <Link href="/" className="jobmatch">JobMatch</Link>
      <nav className="cabecalho-btn">
        <ItemMenu href="/vagas">Vagas</ItemMenu>
        <ItemMenu href="/empresas">Empresas</ItemMenu>
        {ehRecrutador ? <ItemMenu href="/empresa/vagas">Minhas vagas</ItemMenu> : <ItemMenu href="/para-empresas">Para empresas</ItemMenu>}
      </nav>
      <div className="btn-login">
        {usuario ? (
          <>
            {ehCandidato && <Link href="/candidato">Meu painel</Link>}
            {ehAdmin && <Link href="/admin">Painel</Link>}
            <span>{usuario.nome}</span>
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
