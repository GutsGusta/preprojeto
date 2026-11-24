import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pasta onde as fotos ficam salvas (backend/uploads). Ela é servida em /uploads pelo app.js.
export const pastaUploads = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads"
);

const extensoes = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const tamanhoMaximo = 2 * 1024 * 1024; // 2 MB

// Recebe a foto enviada pelo frontend (data URL em base64), confere o tipo e o tamanho,
// salva o arquivo na pasta de uploads e devolve o endereço completo da imagem.
// Devolve null se não veio foto e lança um erro com status 400 se a foto for inválida.
export function salvarImagem(dataUrl, req) {
  if (!dataUrl) return null;

  const partes = String(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!partes) {
    const erro = new Error("A foto precisa ser uma imagem JPG, PNG ou WebP.");
    erro.status = 400;
    throw erro;
  }

  const arquivo = Buffer.from(partes[2], "base64");
  if (arquivo.length > tamanhoMaximo) {
    const erro = new Error("A foto deve ter no máximo 2 MB.");
    erro.status = 400;
    throw erro;
  }

  fs.mkdirSync(pastaUploads, { recursive: true });
  const nome = `${crypto.randomUUID()}.${extensoes[partes[1]]}`;
  fs.writeFileSync(path.join(pastaUploads, nome), arquivo);

  return `${req.protocol}://${req.get("host")}/uploads/${nome}`;
}

// Apaga uma foto salva (usado quando o cadastro falha depois de a foto já ter sido gravada).
export function apagarImagem(url) {
  if (!url) return;
  try {
    fs.unlinkSync(path.join(pastaUploads, path.basename(url)));
  } catch {
    /* arquivo já não existe */
  }
}
