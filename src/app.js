import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";

// Rotas
import vehiclesRoutes from "./routes/vehicles.routes.js";
import vehiclesApplicationsRoutes from "./routes/vehiclesApplications.routes.js";
import vehiclesPartsRoutes from "./routes/vehiclesParts.routes.js";
import partsRoutes from "./routes/parts.routes.js";
import compatibilitiesRoutes from "./routes/compatibilities.routes.js";
import searchRoutes from "./routes/search.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import plateRoutes from "./routes/plate.routes.js";
import chassiRoutes from "./routes/chassi.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Middlewares
import errorMiddleware from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import logger from "./utils/logger.js";

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body parsers ──────────────────────────────────────────────────────────────
// Webhooks MP precisam do body raw para validação de assinatura
app.use(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Converte raw buffer para objeto se necessário
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch {
        req.body = {};
      }
    }
    next();
  }
);
app.use(express.json());

// ─── Log de requisições em produção ───────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    res.on("finish", () => {
      if (req.path !== "/health") {
        logger.info("request", {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          ip: req.ip,
        });
      }
    });
    next();
  });
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ─── Rate limit global em produção ────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(apiLimiter);
}

// ─── Rotas da API ──────────────────────────────────────────────────────────────
app.use("/vehicles", vehiclesRoutes);
app.use("/vehicles", vehiclesApplicationsRoutes);
app.use("/vehicles", vehiclesPartsRoutes);
app.use("/parts", partsRoutes);
app.use("/compatibilities", compatibilitiesRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/marketplaceParts", marketplaceRoutes);
app.use("/plate-search", plateRoutes);
app.use("/chassi", chassiRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/admin", adminRoutes);

// ─── Documentação ─────────────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Error handler (sempre por último) ────────────────────────────────────────
app.use(errorMiddleware);

export default app;
