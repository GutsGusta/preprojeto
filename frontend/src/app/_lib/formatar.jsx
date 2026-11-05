export const MODALIDADE = { PRESENCIAL: 'Presencial', HIBRIDO: 'Híbrido', REMOTO: 'Remoto' };
export const CONTRATO = { CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCER: 'Freelancer' };
export const STATUS_VAGA = { RASCUNHO: 'Rascunho', ABERTA: 'Aberta', PAUSADA: 'Pausada', ENCERRADA: 'Encerrada' };
export const STATUS_CANDIDATURA = {
  EM_ANDAMENTO: 'Em andamento', APROVADO_ETAPA: 'Aprovado na etapa',
  CONTRATADO: 'Contratado', REPROVADO: 'Reprovado', DESISTIU: 'Desistiu',
};

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function faixaSalarial(min, max) {
  if (min == null && max == null) return 'Salário a combinar';
  if (min != null && max != null) return min === max ? moeda.format(min) : `${moeda.format(min)} a ${moeda.format(max)}`;
  return min != null ? `A partir de ${moeda.format(min)}` : `Até ${moeda.format(max)}`;
}

// Cidade da vaga; vazio quando é remota sem cidade (a modalidade já diz "Remoto")
export function local(vaga) {
  return [vaga.cidade, vaga.uf].filter(Boolean).join(', ');
}

export function data(iso) {
  if (!iso) return '—';
  // Datas sem horário (ex.: 2024-03-01) são mostradas como estão, sem ajuste de fuso
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function haQuantoTempo(iso) {
  if (!iso) return '';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return `em ${data(iso)}`;
}

export const iniciais = (nome = '') =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
