import {
  lookupChassi,
  generateDesmancheCatalog,
  publishDesmancheLot,
} from "../services/chassi.service.js";
import AppError from "../errors/AppError.js";

export async function getChassi(req, res, next) {
  try {
    const { vin } = req.params;
    const vehicle = await lookupChassi(vin);
    const catalog = await generateDesmancheCatalog(vin, vehicle);
    return res.json({ success: true, data: { vehicle, catalog } });
  } catch (err) {
    if (err.message?.includes("inválido") || err.message?.includes("decodificar")) {
      return next(new AppError(err.message, 400, "INVALID_VIN"));
    }
    next(err);
  }
}

export async function publishLot(req, res, next) {
  try {
    const sellerId = req.user.uid;
    const { vin, vehicleData, selectedSubcollections } = req.body;

    if (!vin || !vehicleData || !selectedSubcollections?.length) {
      throw new AppError("Dados incompletos", 400, "VALIDATION_ERROR");
    }

    const result = await publishDesmancheLot({
      sellerId,
      vin,
      vehicleData,
      selectedSubcollections,
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
