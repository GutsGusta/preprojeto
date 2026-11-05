'use client';

import { useState } from 'react';
import { favoritosApi } from '../_lib/servicos';
import { IconeCoracao } from './Icones';

// Coração que salva/remove a vaga dos favoritos (RF13). Atualiza na hora e desfaz se a API falhar.
export default function BotaoFavorito({ vagaId, favorita, aoMudar, comTexto }) {
  const [ativo, setAtivo] = useState(Boolean(favorita));
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novo = !ativo;
    setAtivo(novo);
    setSalvando(true);
    try {
      await (novo ? favoritosApi.favoritarVaga(vagaId) : favoritosApi.desfavoritarVaga(vagaId));
      aoMudar?.(novo);
    } catch {
      setAtivo(!novo);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <button
      type="button"
      className={`botao neutro favorito${comTexto ? '' : ' icone'}`}
      aria-pressed={ativo}
      aria-label={comTexto ? undefined : (ativo ? 'Remover dos favoritos' : 'Salvar nos favoritos')}
      onClick={alternar}
      disabled={salvando}
    >
      <IconeCoracao cheio={ativo} />
      {comTexto && (ativo ? 'Favoritada' : 'Favoritar')}
    </button>
  );
}
