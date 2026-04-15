import admin from "firebase-admin";

const bucket = admin.storage().bucket();

export async function uploadImage(file, path) {
  try {
    const fileName = `${path}/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    await fileUpload.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error("Erro upload imagem:", error);
    throw new Error("Falha ao enviar imagem");
  }
}