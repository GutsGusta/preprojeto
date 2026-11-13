import { api } from './api';

// Uma função por rota da API, para as páginas não montarem URLs na mão.
export const vagasApi = {
  listar: (filtros) => api('/vagas', { parametros: filtros }),
  filtros: () => api('/vagas/filtros'),
  detalhar: (id) => api(`/vagas/${id}`),

  minhas: (filtros) => api('/vagas/minhas', { parametros: filtros }),
  criar: (dados) => api('/vagas', { metodo: 'POST', corpo: dados }),
  atualizar: (id, dados) => api(`/vagas/${id}`, { metodo: 'PUT', corpo: dados }),
  alterarStatus: (id, status) => api(`/vagas/${id}/status`, { metodo: 'PATCH', corpo: { status } }),
  duplicar: (id) => api(`/vagas/${id}/duplicar`, { metodo: 'POST' }),
  excluir: (id) => api(`/vagas/${id}`, { metodo: 'DELETE' }),

  candidaturas: (id) => api(`/vagas/${id}/candidaturas`),
  candidatar: (id, cartaApresentacao) =>
    api(`/vagas/${id}/candidaturas`, { metodo: 'POST', corpo: { cartaApresentacao } }),
};

export const candidaturasApi = {
  detalhar: (id) => api(`/candidaturas/${id}`),
  movimentar: (id, dados) => api(`/candidaturas/${id}/etapa`, { metodo: 'PATCH', corpo: dados }),
  desistir: (id) => api(`/candidaturas/${id}`, { metodo: 'DELETE' }),
  motivos: () => api('/candidaturas/motivos-reprovacao'),
};

export const favoritosApi = {
  vagas: () => api('/favoritos/vagas'),
  favoritarVaga: (id) => api('/favoritos', { metodo: 'POST', corpo: { tipo: 'VAGA', referenciaId: id } }),
  desfavoritarVaga: (id) => api(`/favoritos/VAGA/${id}`, { metodo: 'DELETE' }),
};

export const habilidadesApi = {
  buscar: (q) => api('/habilidades', { parametros: { q } }),
};

export const authApi = {
  login: (email, senha) => api('/auth/login', { metodo: 'POST', corpo: { email, senha } }),
  eu: () => api('/auth/me'),
  cadastrar: (dados) => api('/auth/cadastro', { metodo: 'POST', corpo: dados }),
};
