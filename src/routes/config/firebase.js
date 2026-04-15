import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Corrige __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Verifica se variável existe ANTES de usar
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error(
    "❌ GOOGLE_APPLICATION_CREDENTIALS não definido no .env"
  );
}

// Resolve caminho absoluto
const credentialPath = path.resolve(
  __dirname,
  "../../",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

// Verifica se arquivo existe
if (!fs.existsSync(credentialPath)) {
  throw new Error(
    `❌ Arquivo de credencial não encontrado em: ${credentialPath}`
  );
}

// Inicializa Firebase
admin.initializeApp({
  credential: admin.credential.cert(credentialPath),
});

const db = admin.firestore();

export { db };