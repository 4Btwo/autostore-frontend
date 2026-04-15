import { db, admin } from "../config/firebase.js";
import { uploadImage } from "../services/cloudinary.service.js";
import AppError from "../errors/AppError.js";
import logger from "../utils/logger.js";

export async function createUserProfile(req, res, next) {
  try {
    const uid = req.user.uid;
    const email = req.user.email;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.json({ success: true, message: "Usuário já existe", data: userDoc.data() });
    }

    const newUser = {
      name: req.body.name || null,
      email,
      type: req.body.type || "buyer",
      sellerVerified: false,
      isPremium: false,
      isAdmin: false,
      active: true,
      ratingAvg: null,
      ratingCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(newUser);
    logger.info("Novo usuário criado", { uid, email });
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
}

export async function updateUserPhoto(req, res, next) {
  try {
    const uid = req.user.uid;
    if (!req.file) throw new AppError("Nenhuma foto enviada", 400, "NO_FILE");

    const { url } = await uploadImage(req.file.buffer, "profiles");

    await db.collection("users").doc(uid).update({
      photo: url,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Foto de usuário atualizada", { uid });
    return res.json({ success: true, data: { photo: url } });
  } catch (error) {
    next(error);
  }
}

export async function getMyProfile(req, res, next) {
  try {
    const uid = req.user.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) throw new AppError("Perfil não encontrado", 404, "NOT_FOUND");

    const { isAdmin, ...safeData } = doc.data();
    return res.json({ success: true, data: { id: doc.id, ...safeData } });
  } catch (error) {
    next(error);
  }
}
