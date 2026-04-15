// src/controllers/vehicles.controller.js

import * as VehiclesService from '../services/vehicles.service.js';
import * as VehiclesPartsService from '../services/vehiclesParts.service.js';
import { successResponse } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const vehicles = await VehiclesService.list();
    return successResponse(res, vehicles);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const vehicle = await VehiclesService.getById(req.params.id);
    return successResponse(res, vehicle);
  } catch (error) {
    next(error);
  }
}

export async function getApplications(req, res, next) {
  try {
    const applications = await VehiclesService.getApplications(req.params.id);
    return successResponse(res, applications);
  } catch (error) {
    next(error);
  }
}

/**
 * Mantido para compatibilidade com routes existentes
 */
export async function create(req, res, next) {
  try {
    const vehicle = await VehiclesService.create(req.body);
    return successResponse(res, vehicle, {}, 201);
  } catch (error) {
    next(error);
  }
}
/**
 * 🔑 Endpoint histórico: /vehicles/:vehicleId/parts
 * Apenas delega para o service correto
 */
export async function listVehicleParts(req, res, next) {
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