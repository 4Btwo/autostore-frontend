import {
  createMarketplacePartService,
  updateMarketplacePartImages,
} from "../services/marketplace.service.js";
import { uploadImage } from "../services/cloudinary.service.js";
import { successResponse } from "../utils/response.js";
import AppError from "../errors/AppError.js";

export async function createMarketplacePart(req, res, next) {
  try {
    const sellerId = req.user.uid;
    const files = req.files || [];

    const imageUploads = await Promise.all(
      files.map((file) => uploadImage(file.buffer, "parts"))
    );
    const images = imageUploads.map((img) => img.url);

    const result = await createMarketplacePartService({
      ...req.body,
      sellerId,
      images,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updatePartImages(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.user.uid;
    const files = req.files || [];

    if (!files.length) {
      throw new AppError("Nenhuma imagem enviada", 400, "NO_FILES");
    }

    const imageUploads = await Promise.all(
      files.map((file) => uploadImage(file.buffer, "parts"))
    );
    const newImages = imageUploads.map((img) => img.url);

    const result = await updateMarketplacePartImages(id, sellerId, newImages);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}
