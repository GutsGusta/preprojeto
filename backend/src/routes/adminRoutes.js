
import { Router } from "express";
import {
    obterResumoAdmin,
    listarUsuarios,
    listarEmpresas,
    relatorioCandidaturas
} from "../controllers/adminController.js";

const router = Router();

router.get("/resumo", obterResumoAdmin);
router.get("/usuarios", listarUsuarios);
router.get("/empresas", listarEmpresas);
router.get("/relatorios/candidaturas", relatorioCandidaturas);

export default router;
