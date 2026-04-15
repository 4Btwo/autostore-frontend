import express from "express";
import { db, admin } from "../config/firebase.js";
import { requireAdmin } from "../middlewares/authMiddleware.js";
import { validate, adminRejectSchema } from "../middlewares/validate.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Todas as rotas admin exigem Custom Claim isAdmin=true
router.use(requireAdmin);

// ─── GET /admin/marketplace-parts ─────────────────────────────────────────────
router.get("/marketplace-parts", async (req, res, next) => {
  try {
    const { status = "pending", limit = 50 } = req.query;

    const snap = await db
      .collection("marketplaceParts")
      .where("moderationStatus", "==", status)
      .orderBy("createdAt", "desc")
      .limit(Number(limit))
      .get();

    if (snap.empty) return res.json({ success: true, data: [] });

    // Coleta sellerIds únicos e busca todos de uma vez — sem N+1
    const sellerIds = [...new Set(snap.docs.map((d) => d.data().sellerId).filter(Boolean))];
    const sellerDocs = await Promise.all(
      sellerIds.map((id) => db.collection("users").doc(id).get())
    );
    const sellerMap = {};
    sellerDocs.forEach((doc) => {
      if (doc.exists) sellerMap[doc.id] = { uid: doc.id, ...doc.data() };
    });

    const parts = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      seller: sellerMap[doc.data().sellerId] || null,
    }));

    res.json({ success: true, data: parts });
  } catch (e) {
    next(e);
  }
});

// ─── GET /admin/marketplace-parts/stats ──────────────────────────────────────
router.get("/marketplace-parts/stats", async (req, res, next) => {
  try {
    const statuses = ["pending", "approved", "rejected", "flagged"];
    const counts = {};

    await Promise.all(
      statuses.map(async (status) => {
        const snap = await db
          .collection("marketplaceParts")
          .where("moderationStatus", "==", status)
          .count()
          .get();
        counts[status] = snap.data().count;
      })
    );

    res.json({ success: true, data: counts });
  } catch (e) {
    next(e);
  }
});

// ─── PATCH /admin/marketplace-parts/:id/approve ──────────────────────────────
router.patch("/marketplace-parts/:id/approve", async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUid = req.user.uid;

    await db.collection("marketplaceParts").doc(id).update({
      moderationStatus: "approved",
      active: true,
      approvedAt: new Date().toISOString(),
      approvedBy: adminUid,
      rejectionReason: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const partDoc = await db.collection("marketplaceParts").doc(id).get();
    const part = partDoc.data();
    if (part?.sellerId) {
      await db.collection("notifications").add({
        userId: part.sellerId,
        type: "listing_approved",
        title: "Anúncio aprovado! 🎉",
        message: `Seu anúncio "${part.name || "Peça"}" foi aprovado e já está visível no marketplace.`,
        partId: id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    logger.info("Anúncio aprovado", { partId: id, adminUid });
    res.json({ success: true, message: "Anúncio aprovado com sucesso" });
  } catch (e) {
    next(e);
  }
});

// ─── PATCH /admin/marketplace-parts/:id/reject ───────────────────────────────
router.patch(
  "/marketplace-parts/:id/reject",
  validate(adminRejectSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason = "Não aprovado pela moderação" } = req.body;
      const adminUid = req.user.uid;

      await db.collection("marketplaceParts").doc(id).update({
        moderationStatus: "rejected",
        active: false,
        rejectedAt: new Date().toISOString(),
        rejectedBy: adminUid,
        rejectionReason: reason,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const partDoc = await db.collection("marketplaceParts").doc(id).get();
      const part = partDoc.data();
      if (part?.sellerId) {
        await db.collection("notifications").add({
          userId: part.sellerId,
          type: "listing_rejected",
          title: "Anúncio não aprovado",
          message: `Seu anúncio "${part.name || "Peça"}" foi rejeitado. Motivo: ${reason}`,
          partId: id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      logger.info("Anúncio rejeitado", { partId: id, adminUid, reason });
      res.json({ success: true, message: "Anúncio rejeitado" });
    } catch (e) {
      next(e);
    }
  }
);

// ─── PATCH /admin/marketplace-parts/:id/flag ─────────────────────────────────
router.patch("/marketplace-parts/:id/flag", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note = "Marcado para revisão" } = req.body;
    const adminUid = req.user.uid;

    await db.collection("marketplaceParts").doc(id).update({
      moderationStatus: "flagged",
      active: false,
      flaggedAt: new Date().toISOString(),
      flaggedBy: adminUid,
      flagNote: note,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Anúncio sinalizado", { partId: id, adminUid });
    res.json({ success: true, message: "Anúncio marcado como suspeito" });
  } catch (e) {
    next(e);
  }
});

// ─── POST /admin/set-admin-claim ─────────────────────────────────────────────
// Promove um usuário a admin via Custom Claim (use apenas para configuração inicial)
router.post("/set-admin-claim", async (req, res, next) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid)
      return res.status(400).json({ success: false, message: "targetUid obrigatório" });

    await admin.auth().setCustomUserClaims(targetUid, { isAdmin: true });

    // Atualiza também no Firestore para referência
    await db.collection("users").doc(targetUid).update({ isAdmin: true });

    logger.info("Custom claim isAdmin definido", {
      targetUid,
      setBy: req.user.uid,
    });

    res.json({
      success: true,
      message: `Usuário ${targetUid} promovido a admin. Ele precisará fazer login novamente para o token atualizar.`,
    });
  } catch (e) {
    next(e);
  }
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get("/users", async (req, res, next) => {
  try {
    const { limit = 50, type } = req.query;
    let query = db.collection("users");
    if (type) query = query.where("type", "==", type);
    query = query.orderBy("createdAt", "desc").limit(Number(limit));

    const snap = await query.get();
    const users = snap.docs.map((doc) => {
      const d = doc.data();
      // Nunca retorna dados sensíveis
      const { password, ...safe } = d;
      return { id: doc.id, ...safe };
    });

    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
});

export default router;
