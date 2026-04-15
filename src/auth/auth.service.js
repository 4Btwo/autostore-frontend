import { db } from "../config/firebase.js";

export async function createUserProfile(user) {
  const userRef = db.collection("users").doc(user.uid);

  const snapshot = await userRef.get();

  if (snapshot.exists) {
    return snapshot.data();
  }

  const newUser = {
    uid: user.uid,
    email: user.email,
    name: user.name || null,
    role: "buyer",
    phone: null,
    active: true,
    createdAt: new Date(),
  };

  await userRef.set(newUser);

  return newUser;
}