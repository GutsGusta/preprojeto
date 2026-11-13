
import { Router } from "express";
import { exigirAdmin } from "../middlewares/adminMiddleware.js";

import {
    obterResumoAdmin,
    listarUsuarios,
    listarEmpresas,
    relatorioCandidaturas,
    listarVagasEmpresa,
    alterarSituacaoUsuario,
    excluirUsuario
} from "../controllers/adminController.js";

const router = Router();

// Todas as rotas exigem autenticação de administrador
router.use(exigirAdmin);

// Consultas
router.get("/resumo", obterResumoAdmin);
router.get("/usuarios", listarUsuarios);
router.get("/empresas", listarEmpresas);
router.get("/empresas/:id/vagas", listarVagasEmpresa);
router.get("/relatorios/candidaturas", relatorioCandidaturas);

// Gerenciamento de usuários
router.patch("/usuarios/:id/situacao", alterarSituacaoUsuario);
router.delete("/usuarios/:id", excluirUsuario);

export default router;
