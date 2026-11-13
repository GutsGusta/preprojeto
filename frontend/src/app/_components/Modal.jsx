'use client';

import { useEffect, useRef } from 'react';
import { IconeFechar } from './Icones';

// Janela sobreposta. Fecha com Esc ou clicando fora; foca o conteúdo ao abrir.
export default function Modal({ titulo, subtitulo, aoFechar, children, rodape }) {
  const ref = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    ref.current?.focus();
    const tecla = (e) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('keydown', tecla); anterior?.focus?.(); };
  }, [aoFechar]);

  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" tabIndex={-1} ref={ref}>
        <header>
          <div>
            <h2 id="modal-titulo">{titulo}</h2>
            {subtitulo && <p className="texto-2 pequeno">{subtitulo}</p>}
          </div>
          <button type="button" className="botao neutro icone" onClick={aoFechar} aria-label="Fechar"><IconeFechar /></button>
        </header>
        <div className="corpo">{children}</div>
        {rodape && <footer>{rodape}</footer>}
      </div>
    </div>
  );
}
