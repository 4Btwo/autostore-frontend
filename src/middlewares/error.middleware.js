import { errorResponse } from "../utils/response.js";
import logger from "../utils/logger.js";

export default function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_ERROR";
  const message = error.message || "Erro interno do servidor";

  // Log completo com contexto da requisição
  logger.error(message, {
    code,
    statusCode,
    method: req.method,
    path: req.path,
    uid: req.user?.uid || null,
    stack: statusCode >= 500 ? error.stack : undefined,
  });

  return errorResponse(res, message, code, statusCode);
}
