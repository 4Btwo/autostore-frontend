import * as VehiclesPartsService from "../services/vehiclesParts.service.js";
import { successResponse } from "../utils/response.js";

export async function listByVehicle(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const { application, categoryId, engine, position } = req.query;

    const parts = await VehiclesPartsService.getPartsByVehicle(vehicleId, {
      application,
      categoryId,
      engine,
      position,
    });

    return successResponse(res, parts);
  } catch (error) {
    next(error);
  }
}