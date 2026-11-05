
import { Router } from "express";
import {
    obterResumoAdmin,
    listarUsuarios,
    listarEmpresas
} from "../controllers/adminController.js";

const router = Router();

router.get("/resumo", obterResumoAdmin);
router.get("/usuarios", listarUsuarios);
router.get("/empresas", listarEmpresas);

export default router;
