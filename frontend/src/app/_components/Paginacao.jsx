// Paginação simples: anterior, números próximos da página atual, próxima
export default function Paginacao({ pagina, totalPaginas, aoMudar }) {
  if (totalPaginas <= 1) return null;
  const inicio = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
  const paginas = Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => inicio + i);

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button type="button" className="botao neutro" disabled={pagina === 1} onClick={() => aoMudar(pagina - 1)} aria-label="Página anterior">‹</button>
      {paginas.map((p) => (
        <button key={p} type="button" className="botao neutro" aria-current={p === pagina ? 'page' : undefined} onClick={() => aoMudar(p)}>{p}</button>
      ))}
      <button type="button" className="botao neutro" disabled={pagina === totalPaginas} onClick={() => aoMudar(pagina + 1)} aria-label="Próxima página">›</button>
    </nav>
  );
}
