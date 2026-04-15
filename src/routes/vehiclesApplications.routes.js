import { Router } from "express";
import { listApplications } from "../controllers/vehiclesApplications.controller.js";

const router = Router();

/**
 * @swagger
 * /vehicles/{vehicleId}/applications:
 *   get:
 *     summary: Lista aplicações disponíveis para um veículo
 *     tags:
 *       - Vehicles
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     responses:
 *       200:
 *         description: Lista de aplicações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/:vehicleId/applications", listApplications);

export default router;