import { Router } from "express";
import { exigirCandidato, exigirRecrutador, identificarSeLogado } from "../middlewares/autenticacao.js";
import {
    listarVagas,
    listarFiltros,
    detalharVaga,
    listarMinhasVagas,
    criarVaga,
    atualizarVaga,
    alterarStatusVaga,
    duplicarVaga,
    excluirVaga
} from "../controllers/vagasController.js";
import { candidatar, listarCandidaturasDaVaga } from "../controllers/candidaturasController.js";

const router = Router();

router.get("/", identificarSeLogado, listarVagas);
router.get("/filtros", listarFiltros);
router.get("/minhas", exigirRecrutador, listarMinhasVagas);
router.post("/", exigirRecrutador, criarVaga);
router.get("/:id", identificarSeLogado, detalharVaga);
router.put("/:id", exigirRecrutador, atualizarVaga);
router.patch("/:id/status", exigirRecrutador, alterarStatusVaga);
router.post("/:id/duplicar", exigirRecrutador, duplicarVaga);
router.delete("/:id", exigirRecrutador, excluirVaga);
router.get("/:id/candidaturas", exigirRecrutador, listarCandidaturasDaVaga);
router.post("/:id/candidaturas", exigirCandidato, candidatar);

export default router;
