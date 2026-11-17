import { Router } from "express";
import { listarVagasRecentes } from "../controllers/homeController.js";

const router = Router();

router.get("/vagas-recentes", listarVagasRecentes);

export default router;
