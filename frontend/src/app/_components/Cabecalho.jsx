'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import { iniciais } from '../_lib/formatar';

// Link do menu que fica destacado na página atual
function ItemMenu({ href, exato, children }) {
  const caminho = usePathname();
  const ativo = exato ? caminho === href : caminho === href || caminho.startsWith(`${href}/`);
  return <Link href={href} className={ativo ? 'ativo' : undefined} aria-current={ativo ? 'page' : undefined}>{children}</Link>;
}

export default function Cabecalho() {
  const { usuario, ehCandidato, ehRecrutador, sair } = useAuth();
  const caminho = usePathname();
  const router = useRouter();
  if (caminho === '/login') return null;

  return (
    <header className="cabecalho">
      <div className="container">
        <Link href="/vagas" className="marca">JobMatch</Link>
        <nav className="nav" aria-label="Principal">
          <ItemMenu href="/vagas">Vagas</ItemMenu>
          {ehCandidato && <ItemMenu href="/favoritos">Favoritas</ItemMenu>}
          {ehRecrutador && <ItemMenu href="/empresa/vagas" exato>Minhas vagas</ItemMenu>}
          {ehRecrutador && <ItemMenu href="/empresa/vagas/nova" exato>Nova vaga</ItemMenu>}
        </nav>
        {usuario ? (
          <div className="usuario-menu">
            <span className="avatar" aria-hidden="true">{iniciais(usuario.nome)}</span>
            <span>
              <strong>{usuario.nome}</strong>
              {usuario.empresaNome && <span className="texto-2"> · {usuario.empresaNome}</span>}
            </span>
            <button type="button" className="botao neutro pequeno" onClick={() => { sair(); router.push('/vagas'); }}>Sair</button>
          </div>
        ) : (
          <Link href="/login" className="botao secundario pequeno">Entrar</Link>
        )}
      </div>
    </header>
  );
}
