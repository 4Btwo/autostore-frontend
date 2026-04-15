import { Router } from "express";
import * as VehiclesController from "../controllers/vehicles.controller.js";

const router = Router();

// lista todos os veículos
router.get("/", VehiclesController.list);

// busca veículo por id
router.get("/:id", VehiclesController.getById);

export default router;