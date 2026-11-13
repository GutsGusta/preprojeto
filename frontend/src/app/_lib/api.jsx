// Cliente HTTP da API. Coloca o token de login em todas as requisições
// e transforma respostas de erro em exceções com a mensagem da API.
// Endereço da API vem do .env.local (NEXT_PUBLIC_API_URL)
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const CHAVE_TOKEN = 'jobmatch.token';

export const tokenSalvo = {
  ler: () => { try { return localStorage.getItem(CHAVE_TOKEN); } catch { return null; } },
  gravar: (t) => { try { localStorage.setItem(CHAVE_TOKEN, t); } catch { /* sem armazenamento */ } },
  apagar: () => { try { localStorage.removeItem(CHAVE_TOKEN); } catch { /* sem armazenamento */ } },
};

export class ErroApi extends Error {
  constructor(status, corpo) {
    super(corpo?.mensagem || 'Não foi possível completar a ação.');
    this.status = status;
    this.codigo = corpo?.erro;
    this.detalhes = corpo?.detalhes || {};
  }
}

// Quem quiser saber quando a sessão expira (o AuthContext) registra aqui
let aoExpirar = () => {};
export const quandoSessaoExpirar = (fn) => { aoExpirar = fn; };

export async function api(caminho, { metodo = 'GET', corpo, parametros } = {}) {
  let url = BASE + caminho;
  if (parametros) {
    const qs = new URLSearchParams(
      Object.entries(parametros).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length))
        .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const cabecalhos = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  const token = tokenSalvo.ler();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(url, { method: metodo, headers: cabecalhos, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  } catch {
    throw new ErroApi(0, { mensagem: 'Sem conexão com a API. Verifique se o backend está rodando e o NEXT_PUBLIC_API_URL.' });
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    if (resposta.status === 401 && token) aoExpirar();
    throw new ErroApi(resposta.status, dados);
  }
  return dados;
}
