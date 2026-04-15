import express from "express";
import multer from "multer";
import {
  createUserProfile,
  updateUserPhoto,
  getMyProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});

router.post("/create-profile", authenticate, createUserProfile);
router.get("/me", authenticate, getMyProfile);
router.patch("/photo", authenticate, upload.single("photo"), updateUserPhoto);

export default router;
