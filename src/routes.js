import express from "express";

import vehiclesRoutes from "./routes/vehicles.routes.js";
import partsRoutes from "./routes/parts.routes.js";
import compatibilitiesRoutes from "./routes/compatibilities.routes.js";
import vehiclesPartsRoutes from "./routes/vehiclesParts.routes.js";
import searchRoutes from "./routes/search.routes.js";
import plateRoutes from "./routes/plate.routes.js";

const router = express.Router();

router.use("/plate-search", plateRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/parts", partsRoutes);
router.use("/compatibilities", compatibilitiesRoutes);
router.use("/vehicles-parts", vehiclesPartsRoutes);
router.use("/search", searchRoutes);

export default router;