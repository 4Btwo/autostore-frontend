import { registerUser } from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);

    return res.json({
      success: true,
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
}