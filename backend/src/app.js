import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import candidatoRoutes from "./routes/candidatoRoutes.js";
import vagasRoutes from "./routes/vagasRoutes.js";
import candidaturasRoutes from "./routes/candidaturasRoutes.js";
import favoritosRoutes from "./routes/favoritosRoutes.js";
import habilidadesRoutes from "./routes/habilidadesRoutes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import { pastaUploads } from "./utils/imagens.js";

const app = express();

app.use(helmet());

const origensPermitidas = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origem) => origem.trim());
app.use(
  cors({
    origin(origem, responder) {
      const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origem || "");
      responder(null, !origem || local || origensPermitidas.includes(origem));
    },
  }),
);


// Limite maior que o padrão porque a foto do cadastro viaja em base64 dentro do JSON
app.use(express.json({ limit: "3mb" }));

// Fotos enviadas (candidatos e empresas). O cabeçalho libera o uso da imagem pelo frontend (outra porta).
app.use(
  "/uploads",
  (request, response, next) => {
    response.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(pastaUploads)
);

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/home", homeRoutes);

app.use("/api/candidato", candidatoRoutes);

app.use("/api/vagas", vagasRoutes);

app.use("/api/candidaturas", candidaturasRoutes);

app.use("/api/favoritos", favoritosRoutes);

app.use("/api/habilidades", habilidadesRoutes);

app.use("/api/empresas", empresasRoutes);

app.use(errorHandler);

export default app;
