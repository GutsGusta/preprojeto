import { Router } from "express";
import { listarVagasRecentes, obterNumeros } from "../controllers/homeController.js";

const router = Router();

router.get("/vagas-recentes", listarVagasRecentes);
router.get("/numeros", obterNumeros);

export default router;
