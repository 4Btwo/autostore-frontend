import { db } from "../config/firebase.js";

export async function createVehicleBrand(data) {
  const ref = await db.collection("vehicleBrands").add(data);
  return { id: ref.id, ...data };
}

export async function createVehicleModel(data) {
  const ref = await db.collection("vehicleModels").add(data);
  return { id: ref.id, ...data };
}

export async function createVehicleGeneration(data) {
  const ref = await db.collection("vehicleGenerations").add(data);
  return { id: ref.id, ...data };
}

export async function createVehicleVersion(data) {
  const ref = await db.collection("vehicleVersions").add(data);
  return { id: ref.id, ...data };
}

export async function createVehicleEngine(data) {
  const ref = await db.collection("vehicleEngines").add(data);
  return { id: ref.id, ...data };
}

export async function createVehicleTechnical(data) {
  const ref = await db.collection("vehicleTechnicals").add(data);
  return { id: ref.id, ...data };
}