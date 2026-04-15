import { Router } from "express";
import { create, listMyOrders, updateStatus } from "../controllers/orders.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validate, createOrderSchema, updateOrderStatusSchema } from "../middlewares/validate.js";

const router = Router();

router.post("/", authenticate, validate(createOrderSchema), create);
router.get("/my", authenticate, listMyOrders);
router.patch("/:orderId/status", authenticate, validate(updateOrderStatusSchema), updateStatus);

export default router;
