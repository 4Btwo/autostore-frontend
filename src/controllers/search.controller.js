import { executeSearch } from "../services/search.service.js";
import { getVehicleByPlate } from "../services/plate.service.js";
import AppError from "../errors/AppError.js";

export async function searchParts(req, res, next) {
  try {
    const { plate, ...manualData } = req.body;

    let vehicleData;

    if (plate) {
      // Busca dados reais do veículo pela placa
      const vehicle = await getVehicleByPlate(plate);
      if (!vehicle) {
        throw new AppError("Veículo não encontrado para esta placa", 404, "VEHICLE_NOT_FOUND");
      }
      vehicleData = {
        brand: vehicle.brand,
        model: vehicle.model,
        engineDisplacement: vehicle.engine,
        fuelType: vehicle.fuel,
      };
    } else {
      vehicleData = manualData;
    }

    if (!vehicleData.brand || !vehicleData.model) {
      throw new AppError(
        "Informe marca e modelo, ou uma placa válida",
        400,
        "MISSING_VEHICLE_DATA"
      );
    }

    const results = await executeSearch(vehicleData);

    return res.json({
      success: true,
      vehicle: vehicleData,
      ...results,
    });
  } catch (error) {
    next(error);
  }
}
