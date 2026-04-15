import { Router } from "express";
import { createPayment, webhook, getPaymentStatus } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { webhookLimiter } from "../middlewares/rateLimiter.js";
import { validate, createOrderSchema } from "../middlewares/validate.js";

const router = Router();

router.post("/create", authenticate, validate(createOrderSchema), createPayment);
router.post("/webhook", webhookLimiter, webhook);
router.get("/status/:orderId", authenticate, getPaymentStatus);

export default router;
