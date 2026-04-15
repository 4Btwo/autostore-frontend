import { db } from "../config/firebase.js";

export async function getPartsByVehicle(vehicleId) {
  // Usa a coleção flat de compatibilidades — sem varrer toda a coleção parts
  const compatSnap = await db
    .collection("compatibilities")
    .where("vehicleId", "==", vehicleId)
    .where("active", "==", true)
    .get();

  if (compatSnap.empty) return [];

  const partIds = [...new Set(compatSnap.docs.map((d) => d.data().masterPartId).filter(Boolean))];
  if (!partIds.length) return [];

  // Busca em chunks de 10
  const chunks = [];
  for (let i = 0; i < partIds.length; i += 10) chunks.push(partIds.slice(i, i + 10));

  const results = await Promise.all(
    chunks.map((chunk) =>
      db.collection("masterParts").where("__name__", "in", chunk).get()
    )
  );

  return results.flatMap((snap) =>
    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  );
}

export async function findPartsByVehicle(vehicle) {
  return getPartsByVehicle(vehicle);
}
