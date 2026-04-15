import * as CompatibilitiesService from "../services/compatibilities.service.js";
import { successResponse } from "../utils/response.js";

export async function create(req, res, next) {
  try {
    const compatibility = await CompatibilitiesService.create(req.body);
    return successResponse(res, compatibility, {}, 201);
  } catch (error) {
    next(error);
  }
}

export async function listByVehicle(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const filters = req.query;

    const result = await CompatibilitiesService.listByVehicle(vehicleId, filters);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}