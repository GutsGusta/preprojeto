import { Router } from "express";
import { cadastrar, entrar, eu } from "../controllers/authController.js";

const router = Router();

router.post("/cadastro", cadastrar);
router.post("/login", entrar);
router.get("/me", eu);

export default router;
