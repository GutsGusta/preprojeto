// Ícones em SVG (traço), sem bibliotecas externas
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconeCoracao = ({ cheio }) => (
  <svg {...base} fill={cheio ? 'currentColor' : 'none'}><path d="M12 20.5s-7.5-4.6-9.6-9.3A5.4 5.4 0 0 1 12 5.6a5.4 5.4 0 0 1 9.6 5.6c-2.1 4.7-9.6 9.3-9.6 9.3z" /></svg>
);
export const IconeLupa = () => (<svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconeLocal = () => (<svg {...base} width="16" height="16"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const IconeMaleta = () => (<svg {...base} width="16" height="16"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
export const IconeVoltar = () => (<svg {...base} width="18" height="18"><path d="M15 18l-6-6 6-6" /></svg>);
export const IconeFechar = () => (<svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IconeFiltro = () => (<svg {...base} width="18" height="18"><path d="M3 5h18l-7 8v6l-4 2v-8z" /></svg>);
