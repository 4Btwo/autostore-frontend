const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.get("/", async (req, res) => {
  const snapshot = await db.collection("categories").where("active", "==", true).get();
  res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
});

module.exports = router;
