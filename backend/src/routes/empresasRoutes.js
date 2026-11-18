import { Router } from "express";
import { listarEmpresas, detalharEmpresa } from "../controllers/empresasController.js";

const router = Router();

router.get("/", listarEmpresas);
router.get("/:id", detalharEmpresa);

export default router;
