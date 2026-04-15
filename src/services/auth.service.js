import { admin, db } from "../config/firebase.js";

export async function registerUser(data) {
  const user = await admin.auth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
  });

  await db.collection("users").doc(user.uid).set({
    name: data.name,
    email: data.email,
    role: "buyer",
    createdAt: new Date(),
  });

  return user;
}