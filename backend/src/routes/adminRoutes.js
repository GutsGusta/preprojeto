
import { Router } from "express";
import {
    obterResumoAdmin,
    listarUsuarios
} from "../controllers/adminController.js";

const router = Router();

router.get("/resumo", obterResumoAdmin);
router.get("/usuarios", listarUsuarios);

export default router;
