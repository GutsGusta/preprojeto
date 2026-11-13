'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenSalvo, quandoSessaoExpirar } from './api';
import { authApi } from './servicos';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(() => {
    tokenSalvo.apagar();
    setUsuario(null);
  }, []);

  // Ao abrir o site, confere se o token salvo ainda vale
  useEffect(() => {
    quandoSessaoExpirar(sair);
    const pedido = tokenSalvo.ler() ? authApi.eu().then(({ usuario }) => setUsuario(usuario)) : Promise.resolve();
    pedido.catch(sair).finally(() => setCarregando(false));
  }, [sair]);

  const entrar = useCallback(async (email, senha) => {
    const { token, usuario } = await authApi.login(email, senha);
    tokenSalvo.gravar(token);
    setUsuario(usuario);
    return usuario;
  }, []);

  const valor = useMemo(() => ({
    usuario,
    carregando,
    entrar,
    sair,
    ehCandidato: usuario?.perfil === 'CANDIDATO',
    ehRecrutador: usuario?.perfil === 'RECRUTADOR',
    ehAdmin: usuario?.perfil === 'ADMIN',
  }), [usuario, carregando, entrar, sair]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
