import { Router } from "express";
import { exigirCandidato } from "../middlewares/autenticacao.js";
import {
    obterResumoCandidato,
    listarVagasRecomendadas,
    listarAtualizacoes,
    obterCurriculo,
    salvarCurriculo,
    listarMinhasCandidaturas,
    listarHistorico
} from "../controllers/candidatoController.js";

const router = Router();

// Todas as rotas daqui exigem candidato logado
router.use(exigirCandidato);

router.get("/resumo", obterResumoCandidato);
router.get("/vagas-recomendadas", listarVagasRecomendadas);
router.get("/atualizacoes", listarAtualizacoes);
router.get("/curriculo", obterCurriculo);
router.put("/curriculo", salvarCurriculo);
router.get("/candidaturas", listarMinhasCandidaturas);
router.get("/historico", listarHistorico);

export default router;
