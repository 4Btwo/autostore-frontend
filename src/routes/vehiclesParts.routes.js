import { Router } from "express";
import { listByVehicle } from "../controllers/vehiclesParts.controller.js";

const router = Router();

/**
 * @swagger
 * /vehicles/{vehicleId}/parts:
 *   get:
 *     summary: Lista peças compatíveis com um veículo com filtros opcionais
 *     tags:
 *       - Vehicles
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *       - in: query
 *         name: application
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por aplicacao
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de pecas agrupadas por aplicacao
 */
router.get("/:vehicleId/parts", listByVehicle);

export default router;