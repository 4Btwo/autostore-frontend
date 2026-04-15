import { db, admin } from "../config/firebase.js";
import AppError from "../errors/AppError.js";

// ─── Criar pedido com validação transacional de estoque ───────────────────────
// Usa Firestore Transaction para garantir que validação + decremento sejam atômicos.
// Isso previne vender o mesmo item para dois compradores simultâneos.
export async function createOrder(data) {
  const { buyerId, items, total, shippingAddress, skipStockDecrement = false } = data;

  if (skipStockDecrement) {
    // Caminho do Mercado Pago: valida mas não decrementa (MP faz via webhook)
    for (const item of items) {
      const doc = await db
        .collection("marketplaceParts")
        .doc(item.marketplacePartId)
        .get();
      if (!doc.exists)
        throw new AppError(`Peça não encontrada: ${item.marketplacePartId}`, 404, "NOT_FOUND");
      const part = doc.data();
      if (!part.active)
        throw new AppError(`Peça indisponível: ${item.name}`, 400, "PART_UNAVAILABLE");
      if (part.stock < item.quantity)
        throw new AppError(`Estoque insuficiente: ${item.name}`, 400, "INSUFFICIENT_STOCK");
    }

    const orderRef = await db.collection("orders").add({
      buyerId,
      items,
      total: Number(total),
      shippingAddress: shippingAddress || null,
      status: "awaiting_payment",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { orderId: orderRef.id, status: "awaiting_payment" };
  }

  // Caminho direto (sem MP): usa Transaction para validar + decrementar atomicamente
  const orderId = await db.runTransaction(async (transaction) => {
    const partRefs = items.map((item) =>
      db.collection("marketplaceParts").doc(item.marketplacePartId)
    );

    // Lê todos os documentos dentro da transaction
    const partDocs = await Promise.all(partRefs.map((ref) => transaction.get(ref)));

    // Valida cada item
    for (let i = 0; i < items.length; i++) {
      const doc = partDocs[i];
      const item = items[i];
      if (!doc.exists)
        throw new AppError(`Peça não encontrada: ${item.marketplacePartId}`, 404, "NOT_FOUND");
      const part = doc.data();
      if (!part.active)
        throw new AppError(`Peça indisponível: ${item.name}`, 400, "PART_UNAVAILABLE");
      if (part.stock < item.quantity)
        throw new AppError(`Estoque insuficiente: ${item.name}`, 400, "INSUFFICIENT_STOCK");
    }

    // Cria o pedido
    const orderRef = db.collection("orders").doc();
    transaction.set(orderRef, {
      buyerId,
      items,
      total: Number(total),
      shippingAddress: shippingAddress || null,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Decrementa estoque atomicamente
    for (let i = 0; i < items.length; i++) {
      transaction.update(partRefs[i], {
        stock: admin.firestore.FieldValue.increment(-Number(items[i].quantity)),
      });
    }

    return orderRef.id;
  });

  return { orderId, status: "pending" };
}

export async function getOrdersByBuyer(buyerId) {
  const snap = await db
    .collection("orders")
    .where("buyerId", "==", buyerId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? null,
    updatedAt: doc.data().updatedAt?.toDate?.() ?? null,
  }));
}

export async function getOrdersBySeller(sellerId) {
  const snap = await db
    .collection("orders")
    .where("sellerIds", "array-contains", sellerId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? null,
    updatedAt: doc.data().updatedAt?.toDate?.() ?? null,
  }));
}

export async function updateOrderStatus(orderId, newStatus) {
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(newStatus))
    throw new AppError("Status inválido", 400, "INVALID_STATUS");

  await db.collection("orders").doc(orderId).update({
    status: newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { orderId, status: newStatus };
}
