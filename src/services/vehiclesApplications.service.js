import {db} from "../config/firebase.js";

export async function getApplicationsByVehicle(vehicleId) {
  const snap = await db
    .collection("compatibilities")
    .where("vehicleId", "==", vehicleId)
    .where("active", "==", true)
    .get();

  const applicationsSet = new Set();

  snap.docs.forEach(doc => {
    const data = doc.data();
    if (data.application) {
      applicationsSet.add(data.application);
    }
  });

  return Array.from(applicationsSet);
}