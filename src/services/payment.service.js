import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { db, admin } from "../config/firebase.js";
import crypto from "crypto";
import AppError from "../errors/AppError.js";
import logger from "../utils/logger.js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ─── Validação de assinatura do webhook MP ────────────────────────────────────
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export function validateWebhookSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // Em desenvolvimento sem secret configurado, permite (com aviso)
  if (!secret) {
    logger.warn("MP_WEBHOOK_SECRET não configurado — validação de assinatura desativada");
    return true;
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];

  if (!xSignature || !xRequestId) {
    return false;
  }

  // Extrai ts e v1 do header x-signature
  const parts = {};
  xSignature.split(",").forEach((part) => {
    const [key, value] = part.trim().split("=");
    if (key && value) parts[key] = value;
  });

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Monta a string de validação conforme doc MP
  const dataId = req.body?.data?.id || req.query?.["data.id"] || "";
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(v1),
    Buffer.from(expectedSignature)
  );
}

// ─── Criar preferência de pagamento ──────────────────────────────────────────
export async function createPaymentPreference({ orderId, items, buyerEmail, buyerId }) {
  const preference = new Preference(client);

  const mpItems = items.map((item) => ({
    id: item.marketplacePartId,
    title: item.name || "Peça Automotiva",
    description: `OEM: ${item.oemNumber || "—"}`,
    quantity: Number(item.quantity),
    unit_price: Number(item.price),
    currency_id: "BRL",
  }));

  const preferenceData = {
    items: mpItems,
    payer: { email: buyerEmail },
    external_reference: orderId,
    back_urls: {
      success: `${process.env.FRONTEND_URL}/pagamento/sucesso?orderId=${orderId}`,
      failure: `${process.env.FRONTEND_URL}/pagamento/falha?orderId=${orderId}`,
      pending: `${process.env.FRONTEND_URL}/pagamento/pendente?orderId=${orderId}`,
    },
    ...(process.env.FRONTEND_URL?.startsWith("https") && {
      auto_return: "approved",
    }),
    notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
    statement_descriptor: "AUTOSTORE",
    metadata: { orderId, buyerId },
  };

  const result = await preference.create({ body: preferenceData });

  await db.collection("orders").doc(orderId).update({
    mpPreferenceId: result.id,
    mpInitPoint: result.init_point,
    status: "awaiting_payment",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { preferenceId: result.id, initPoint: result.init_point };
}

// ─── Processar webhook do Mercado Pago ────────────────────────────────────────
export async function processWebhook({ type, data }) {
  if (type !== "payment") return { ignored: true, reason: "tipo não é payment" };

  const payment = new Payment(client);
  const paymentData = await payment.get({ id: data.id });

  const orderId = paymentData.external_reference;
  if (!orderId) return { ignored: true, reason: "sem external_reference" };

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) return { ignored: true, reason: "pedido não encontrado" };

  const mpStatus = paymentData.status;
  const statusMap = {
    approved: "confirmed",
    pending: "awaiting_payment",
    in_process: "awaiting_payment",
    rejected: "payment_failed",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "refunded",
  };
  const newStatus = statusMap[mpStatus] || "awaiting_payment";
  const orderData = orderDoc.data();

  // Decrementa estoque somente se aprovado e ainda não processado
  if (mpStatus === "approved" && orderData.status !== "confirmed") {
    const batch = db.batch();
    for (const item of orderData.items || []) {
      if (item.marketplacePartId) {
        const ref = db.collection("marketplaceParts").doc(item.marketplacePartId);
        batch.update(ref, {
          stock: admin.firestore.FieldValue.increment(-Number(item.quantity)),
        });
      }
    }
    await batch.commit();
    logger.info("Estoque decrementado via webhook MP", { orderId, mpStatus });
  }

  // Reverte estoque se cancelado/reembolsado e já estava confirmado
  if (
    ["cancelled", "payment_failed", "refunded"].includes(newStatus) &&
    orderData.status === "confirmed"
  ) {
    const batch = db.batch();
    for (const item of orderData.items || []) {
      if (item.marketplacePartId) {
        const ref = db.collection("marketplaceParts").doc(item.marketplacePartId);
        batch.update(ref, {
          stock: admin.firestore.FieldValue.increment(Number(item.quantity)),
        });
      }
    }
    await batch.commit();
    logger.info("Estoque revertido via webhook MP", { orderId, newStatus });
  }

  await orderRef.update({
    status: newStatus,
    mpPaymentId: String(data.id),
    mpPaymentStatus: mpStatus,
    mpPaymentMethod: paymentData.payment_method_id || null,
    paidAt:
      mpStatus === "approved"
        ? admin.firestore.FieldValue.serverTimestamp()
        : null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { orderId, newStatus, mpStatus };
}
