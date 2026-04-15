import * as PartsService from '../services/parts.service.js';
import { successResponse } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const parts = await PartsService.list();
    return successResponse(res, parts);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const part = await PartsService.getById(req.params.id);
    return successResponse(res, part);
  } catch (error) {
    next(error);
  }
}