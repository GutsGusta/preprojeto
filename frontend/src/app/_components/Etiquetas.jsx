import { STATUS_VAGA, STATUS_CANDIDATURA } from '../_lib/formatar';

export const StatusVaga = ({ status }) => <span className={`status ${status}`}>{STATUS_VAGA[status] || status}</span>;
export const StatusCandidatura = ({ status }) => <span className={`status ${status}`}>{STATUS_CANDIDATURA[status] || status}</span>;

// Score de compatibilidade (recurso avançado). Só aparece para candidatos logados.
export function Match({ valor }) {
  if (valor == null) return null;
  return (
    <span className={`match${valor >= 80 ? ' alto' : ''}`} title="Compatibilidade entre o seu currículo e a vaga">
      Match {valor}%
    </span>
  );
}

export const LogoEmpresa = ({ empresa, grande }) =>
  empresa?.logoUrl
    ? // eslint-disable-next-line @next/next/no-img-element
      <img className={`logo${grande ? ' grande' : ''}`} src={empresa.logoUrl} alt="" />
    : <span className={`logo${grande ? ' grande' : ''}`} aria-hidden="true">{(empresa?.nome || '?').slice(0, 2).toUpperCase()}</span>;
