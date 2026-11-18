import { pool } from "../config/database.js";
import { anexarHabilidades, formatarVaga } from "./vagasController.js";

// GET /api/empresas?q= — empresas cadastradas, com quantas vagas cada uma tem abertas
export async function listarEmpresas(req, res, next) {
  try {
    const termo = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const [empresas] = await pool.query(
      `SELECT e.id_empresa AS id, e.nome_fantasia AS nome, e.setor, e.descricao, e.cidade, e.uf,
              e.logo_url AS logoUrl,
              COUNT(v.id_vaga) AS vagasAbertas
       FROM empresa e
       LEFT JOIN vaga v ON v.empresa_id = e.id_empresa AND v.status = 'PUBLICADA'
       WHERE ? = '' OR e.nome_fantasia LIKE ? OR e.setor LIKE ? OR e.cidade LIKE ?
       GROUP BY e.id_empresa
       ORDER BY vagasAbertas DESC, e.nome_fantasia`,
      [termo, `%${termo}%`, `%${termo}%`, `%${termo}%`]
    );

    return res.json(empresas);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/empresas/:id — perfil público da empresa e as vagas publicadas dela
export async function detalharEmpresa(req, res, next) {
  try {
    const empresaId = Number(req.params.id);
    const [linhas] = await pool.query(
      `SELECT id_empresa AS id, nome_fantasia AS nome, setor, descricao, site, cidade, uf, logo_url AS logoUrl
       FROM empresa
       WHERE id_empresa = ?`,
      [empresaId]
    );

    if (!linhas[0]) {
      return res.status(404).json({ mensagem: "Empresa não encontrada." });
    }

    const [vagas] = await pool.query(
      `SELECT v.*, e.nome_fantasia AS empresa_nome, e.logo_url AS empresa_logo
       FROM vaga v
       JOIN empresa e ON e.id_empresa = v.empresa_id
       WHERE v.empresa_id = ? AND v.status = 'PUBLICADA'
       ORDER BY v.publicada_em DESC`,
      [empresaId]
    );
    await anexarHabilidades(vagas);

    return res.json({ ...linhas[0], vagas: vagas.map(formatarVaga) });
  } catch (erro) {
    next(erro);
  }
}
