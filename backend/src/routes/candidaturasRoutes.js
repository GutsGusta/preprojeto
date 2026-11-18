import { Router } from "express";
import { exigirCandidato, exigirLogin, exigirRecrutador } from "../middlewares/autenticacao.js";
import {
    listarMotivos,
    detalharCandidatura,
    movimentarCandidatura,
    desistirCandidatura
} from "../controllers/candidaturasController.js";

const router = Router();

router.get("/motivos-reprovacao", listarMotivos);
router.get("/:id", exigirLogin, detalharCandidatura);
router.patch("/:id/etapa", exigirRecrutador, movimentarCandidatura);
router.delete("/:id", exigirCandidato, desistirCandidatura);

export default router;
