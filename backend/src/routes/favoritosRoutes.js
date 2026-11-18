import { Router } from "express";
import { exigirCandidato, exigirLogin } from "../middlewares/autenticacao.js";
import { listarVagasFavoritas, adicionarFavorito, removerFavorito } from "../controllers/favoritosController.js";

const router = Router();

router.get("/vagas", exigirCandidato, listarVagasFavoritas);
router.post("/", exigirLogin, adicionarFavorito);
router.delete("/:tipo/:referenciaId", exigirLogin, removerFavorito);

export default router;
