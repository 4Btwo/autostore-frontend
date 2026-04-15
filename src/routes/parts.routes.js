import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { categoryId, vehicleId, oem, q } = req.query;

    if (oem || q) {
      // Busca por OEM ou nome — usa índice do Firestore quando possível
      const term = (oem || q || "").toLowerCase().trim();
      let query = db.collection("masterParts").where("active", "==", true);
      const snap = await query.get();
      const results = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (p) =>
            p.oemNumber?.toLowerCase().includes(term) ||
            p.name?.toLowerCase().includes(term)
        );
      return res.json({ success: true, data: results });
    }

    let query = db.collection("masterParts").where("active", "==", true);
    if (categoryId) query = query.where("categoryId", "==", categoryId);
    const snapshot = await query.orderBy("name").limit(100).get();
    const parts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
});

export default router;
