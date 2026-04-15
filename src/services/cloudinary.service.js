import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Faz upload de um buffer de imagem para o Cloudinary
 * @param {Buffer} buffer — dados do arquivo
 * @param {string} folder — pasta no Cloudinary (ex: "parts", "profiles")
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadImage(buffer, folder = "parts") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `autostore/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: "limit" }, // max 800x800
          { quality: "auto:good" },                    // compressão automática
          { fetch_format: "auto" },                    // webp/avif automático
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Deleta uma imagem do Cloudinary pelo publicId
 */
export async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.error("Erro ao deletar imagem:", e.message);
  }
}
