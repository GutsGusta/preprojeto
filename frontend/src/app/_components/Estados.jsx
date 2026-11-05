export const Carregando = ({ rotulo = 'Carregando…' }) => (
  <div className="carregando" role="status"><span /><span className="sr-only">{rotulo}</span></div>
);

export const EstadoVazio = ({ titulo, children }) => (
  <div className="estado cartao">
    <h2>{titulo}</h2>
    {children}
  </div>
);

export const Aviso = ({ tipo = 'erro', children }) =>
  children ? <div className={`aviso ${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</div> : null;
