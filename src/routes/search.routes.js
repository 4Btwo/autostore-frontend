import { Router } from "express";
import { searchParts } from "../controllers/search.controller.js";
import { publicLimiter } from "../middlewares/rateLimiter.js";
import { validate, searchPartsSchema } from "../middlewares/validate.js";

const router = Router();

router.post("/parts", publicLimiter, validate(searchPartsSchema), searchParts);

export default router;
