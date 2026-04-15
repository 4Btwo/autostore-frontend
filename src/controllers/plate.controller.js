import { getVehicleByPlate } from "../services/plate.service.js";
import { executeSearch } from "../services/search.service.js";
import AppError from "../errors/AppError.js";

export const searchByPlate = async (req, res, next) => {
  try {
    const { plate } = req.body;
    if (!plate) throw new AppError("Placa obrigatória", 400, "VALIDATION_ERROR");

    const vehicle = await getVehicleByPlate(plate);
    if (!vehicle) throw new AppError("Veículo não encontrado", 404, "NOT_FOUND");

    const results = await executeSearch({
      brand: vehicle.brand,
      model: vehicle.model,
      engineDisplacement: vehicle.engine,
      fuelType: vehicle.fuel,
    });

    return res.json({ success: true, vehicle, ...results });
  } catch (error) {
    next(error);
  }
};
