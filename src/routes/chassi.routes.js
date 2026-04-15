import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getChassi, publishLot } from "../controllers/chassi.controller.js";
import { publicLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/:vin", publicLimiter, authMiddleware, getChassi);
router.post("/publish", authMiddleware, publishLot);

export default router;
