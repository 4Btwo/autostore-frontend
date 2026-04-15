import  {db}  from "../config/firebase.js";

async function createVehicle(data) {
  const docRef = await db.collection("vehicles").add({
    ...data,
    active: true,
    createdAt: new Date(),
  });

  return { id: docRef.id, ...data };
}

async function getVehicles() {
  const snapshot = await db.collection("vehicles").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? null,
  }));
}

async function getVehiclesFull() {
  const vehiclesSnap = await db.collection("vehicles").get();

  const vehicles = await Promise.all(
    vehiclesSnap.docs.map(async (doc) => {
      const vehicle = { id: doc.id, ...doc.data() };

      let modelData = null;
      let brandData = null;

      if (vehicle.modelId) {
        const modelSnap = await db
          .collection("models")
          .doc(vehicle.modelId)
          .get();

        if (modelSnap.exists) {
          modelData = modelSnap.data();

          if (modelData.brandId) {
            const brandSnap = await db
              .collection("brands")
              .doc(modelData.brandId)
              .get();

            if (brandSnap.exists) {
              brandData = brandSnap.data();
            }
          }
        }
      }

      return {
        id: vehicle.id,
        brand: brandData ? brandData.name : null,
        model: modelData
          ? { id: vehicle.modelId, name: modelData.name }
          : null,
        version: vehicle.version,
        engine: vehicle.engine,
        fuelType: vehicle.fuelType,
        year:
          vehicle.yearStart && vehicle.yearEnd
            ? `${vehicle.yearStart}–${vehicle.yearEnd}`
            : null,
        active: vehicle.active,
        createdAt: vehicle.createdAt?.toDate?.() ?? null,
      };
    })
  );

  return vehicles;
}

async function getPartsByVehicle(vehicleId) {
  const compatSnap = await db
    .collection("compatibilities")
    .where("vehicleId", "==", vehicleId)
    .where("active", "==", true)
    .get();

  if (compatSnap.empty) return [];

  const partsPromises = compatSnap.docs.map(async (doc) => {
    const { partId } = doc.data();

    const partSnap = await db.collection("parts").doc(partId).get();
    if (!partSnap.exists) return null;

    const part = partSnap.data();
    if (!part.active) return null;

    return {
      id: partSnap.id,
      ...part,
      createdAt: part.createdAt?.toDate?.() ?? null,
    };
  });

  return (await Promise.all(partsPromises)).filter(Boolean);
}

export const vehicleService = {
  createVehicle,
  getVehicles,
  getVehiclesFull,
  getPartsByVehicle,
};
