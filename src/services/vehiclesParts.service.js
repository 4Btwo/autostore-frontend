import {db} from "../config/firebase.js";

export async function getPartsByVehicle(vehicleId, filters = {}) {
  const snapshot = await db
    .collection("compatibilities")
    .where("vehicleId", "==", vehicleId)
    .where("active", "==", true)
    .get();

  let compatibilities = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (filters?.application) {
    compatibilities = compatibilities.filter(
      c => c.application === filters.application
    );
  }

  if (filters?.engine) {
    compatibilities = compatibilities.filter(
      c => c.engine === filters.engine
    );
  }

  if (filters?.position) {
    compatibilities = compatibilities.filter(
      c => c.position === filters.position
    );
  }

  return compatibilities;
}