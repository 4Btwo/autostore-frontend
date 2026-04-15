import { Router } from "express";
import {
  create,
  listByVehicle
} from "../controllers/compatibilities.controller.js";

const router = Router();

router.post("/", create);
router.get("/vehicle/:vehicleId", listByVehicle);

export default router;