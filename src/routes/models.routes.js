const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.get("/", async (req, res) => {
  const { brandId } = req.query;

  let query = db.collection("models").where("active", "==", true);
  if (brandId) query = query.where("brandId", "==", brandId);

  const snapshot = await query.get();
  res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
});

module.exports = router;
