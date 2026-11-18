import { Router } from "express";
import { buscarHabilidades } from "../controllers/habilidadesController.js";

const router = Router();

router.get("/", buscarHabilidades);

export default router;
