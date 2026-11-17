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
  // O dashboard do candidato tem o próprio cabeçalho
  if (caminho === '/login' || caminho.startsWith('/candidato')) return null;

  return (
    <header className="cabecalho">
        <Link href="/ " className="jobmatch">JobMatch</Link>
        <div className="cabecalho-btn">
          <Link href="/vagas">Vagas</Link>
          <Link href="">Empresas</Link>
          <Link href="">Para empresas</Link>
        </div>
        <div className="btn-login">
          {usuario ? (
            <>
              {ehCandidato && <Link href="/candidato">Meu painel</Link>}
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
