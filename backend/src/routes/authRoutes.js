
import { Router } from "express";
import {
  cadastrar,
  entrar,
  eu,
  atualizarPerfil,
  alterarSenha
} from "../controllers/authController.js";

import { exigirLogin } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/cadastro", cadastrar);
router.post("/login", entrar);
router.get("/me", eu);

// Configurações da conta
router.put("/perfil", exigirLogin, atualizarPerfil);
router.put("/senha", exigirLogin, alterarSenha);

export default router;
