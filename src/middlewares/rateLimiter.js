import rateLimit from "express-rate-limit";

// Mensagem padrão de erro
const handler = (req, res) => {
  res.status(429).json({
    success: false,
    error: {
      message: "Muitas requisições. Aguarde um momento e tente novamente.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  });
};

// Rotas públicas sensíveis: busca por placa, chassi, search
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Rotas de autenticação: evitar brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Rotas gerais autenticadas
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Webhooks: limite generoso, MP pode enviar várias notificações
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
