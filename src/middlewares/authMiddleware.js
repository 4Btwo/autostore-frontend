import admin from "firebase-admin";
import AppError from "../errors/AppError.js";

// Autentica qualquer usuário via Firebase ID Token
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Token não enviado", 401, "UNAUTHENTICATED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError("Token inválido ou expirado", 401, "INVALID_TOKEN"));
  }
}

// Verifica se o usuário tem Custom Claim isAdmin=true
// Isso é O(0) — sem roundtrip ao Firestore, a claim está no próprio JWT
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Token não enviado", 401, "UNAUTHENTICATED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    if (!decoded.isAdmin) {
      throw new AppError("Acesso negado — requer perfil admin", 403, "FORBIDDEN");
    }

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError("Token inválido ou expirado", 401, "INVALID_TOKEN"));
  }
}

// Alias para compatibilidade com chassi.routes.js que usa authMiddleware
export const authMiddleware = authenticate;
