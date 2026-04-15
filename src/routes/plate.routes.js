import express from "express";
import { searchByPlate } from "../controllers/plate.controller.js";
import { publicLimiter } from "../middlewares/rateLimiter.js";
import { validate, plateSearchSchema } from "../middlewares/validate.js";

const router = express.Router();

router.post("/", publicLimiter, validate(plateSearchSchema), searchByPlate);

export default router;
