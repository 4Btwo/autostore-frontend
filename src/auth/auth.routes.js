import { Router } from "express";
import { verifyAuth } from "../middleware/auth.middleware.js";
import { syncUser } from "./auth.controller.js";

const router = Router();

router.post("/sync", verifyAuth, syncUser);

export default router;