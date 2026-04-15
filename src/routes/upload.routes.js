import express from "express";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    message: "Upload realizado com sucesso",
    file: fileUrl
  });
});

export default router;