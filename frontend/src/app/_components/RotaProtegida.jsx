'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../_lib/AuthContext';
import { Carregando, EstadoVazio } from './Estados';

// Só mostra a página para quem está logado e tem um dos perfis pedidos
export default function RotaProtegida({ perfis, children }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const caminho = usePathname();

  useEffect(() => {
    if (!carregando && !usuario) router.replace(`/login?voltar=${encodeURIComponent(caminho)}`);
  }, [carregando, usuario, router, caminho]);

  if (carregando || !usuario) return <Carregando />;
  if (perfis && !perfis.includes(usuario.perfil)) {
    return (
      <div className="container pagina">
        <EstadoVazio titulo="Acesso restrito"><p>Esta página não está disponível para o seu perfil.</p></EstadoVazio>
      </div>
    );
  }
  return children;
}
