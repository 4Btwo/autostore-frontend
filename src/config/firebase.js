import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  let serviceAccount;

  // Produção (Render): chave em base64 via env var
  if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    const json = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_B64,
      "base64"
    ).toString("utf8");
    serviceAccount = JSON.parse(json);
  }
  // Desenvolvimento local via arquivo
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const keyPath = path.resolve(
      process.cwd(),
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
    if (!fs.existsSync(keyPath)) {
      throw new Error(`❌ serviceAccountKey.json não encontrado em: ${keyPath}`);
    }
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } else {
    throw new Error(
      "❌ Nenhuma credencial Firebase encontrada. " +
        "Defina FIREBASE_SERVICE_ACCOUNT_B64 (produção) ou " +
        "GOOGLE_APPLICATION_CREDENTIALS (desenvolvimento)."
    );
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log("✅ Firebase Admin inicializado");
}

const db = admin.firestore();
export { admin, db };
