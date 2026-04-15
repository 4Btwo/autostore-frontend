import {
  createPaymentPreference,
  processWebhook,
  validateWebhookSignature,
} from "../services/payment.service.js";
import { createOrder } from "../services/orders.service.js";
import { successResponse } from "../utils/response.js";
import { db } from "../config/firebase.js";
import logger from "../utils/logger.js";
import AppError from "../errors/AppError.js";

// POST /payments/create
export async function createPayment(req, res, next) {
  try {
    const buyerId = req.user.uid;
    const buyerEmail = req.user.email;
    const { items, total } = req.body;

    if (!items?.length) {
      throw new AppError("Carrinho vazio", 400, "EMPTY_CART");
    }

    const order = await createOrder({
      buyerId,
      items,
      total,
      skipStockDecrement: true,
    });

    const preference = await createPaymentPreference({
      orderId: order.orderId,
      items,
      buyerEmail,
      buyerId,
    });

    logger.info("Preferência de pagamento criada", {
      orderId: order.orderId,
      buyerId,
    });

    return successResponse(
      res,
      {
        orderId: order.orderId,
        preferenceId: preference.preferenceId,
        initPoint: preference.initPoint,
      },
      {},
      201
    );
  } catch (error) {
    next(error);
  }
}

// POST /payments/webhook
export async function webhook(req, res) {
  try {
    // Valida assinatura do Mercado Pago
    const isValid = validateWebhookSignature(req);
    if (!isValid) {
      logger.warn("Webhook MP com assinatura inválida", {
        ip: req.ip,
        headers: {
          "x-signature": req.headers["x-signature"],
          "x-request-id": req.headers["x-request-id"],
        },
      });
      // Retorna 200 mesmo assim — MP reenviaria se retornarmos erro
      return res.status(200).json({ received: false, reason: "invalid_signature" });
    }

    const { type, data } = req.body;
    const result = await processWebhook({ type, data });

    logger.info("Webhook MP processado", result);
    return res.status(200).json({ received: true, ...result });
  } catch (error) {
    logger.error("Erro no webhook MP", { message: error.message });
    // Sempre responde 200 para o MP não retentar
    return res.status(200).json({ received: true, error: error.message });
  }
}

// GET /payments/status/:orderId
export async function getPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const buyerId = req.user.uid;

    const doc = await db.collection("orders").doc(orderId).get();
    if (!doc.exists)
      throw new AppError("Pedido não encontrado", 404, "NOT_FOUND");

    const order = doc.data();
    if (order.buyerId !== buyerId)
      throw new AppError("Acesso negado", 403, "FORBIDDEN");

    return successResponse(res, {
      orderId,
      status: order.status,
      mpPaymentStatus: order.mpPaymentStatus || null,
      mpPaymentMethod: order.mpPaymentMethod || null,
      paidAt: order.paidAt?.toDate?.() || null,
      total: order.total,
    });
  } catch (error) {
    next(error);
  }
}
