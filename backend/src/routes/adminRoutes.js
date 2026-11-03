
import { Router } from "express";
import { obterResumoAdmin } from "../controllers/adminController.js";

const router = Router();

router.get("/resumo", obterResumoAdmin);

export default router;
