import { createUserProfile } from "./auth.service.js";

export async function syncUser(req, res, next) {
  try {
    const user = req.user;

    const profile = await createUserProfile(user);

    return res.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    next(error);
  }
}