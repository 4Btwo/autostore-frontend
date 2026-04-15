import { db } from "../config/firebase.js";

// ─── Busca IDs compatíveis na coleção flat ────────────────────────────────────
export async function findCompatiblePartIds({
  brandSlug,
  modelSlug,
  engineDisplacement,
  fuelNorm,
}) {
  const snapshot = await db
    .collection("compatibilities")
    .where("brandSlug", "==", brandSlug)
    .where("modelSlug", "==", modelSlug)
    .where("engineDisplacement", "==", engineDisplacement)
    .where("fuelNorm", "==", fuelNorm)
    .where("active", "==", true)
    .get();

  if (snapshot.empty) return [];

  const ids = new Set();
  snapshot.docs.forEach((doc) => {
    const id = doc.data().masterPartId;
    if (id) ids.add(id);
  });

  return [...ids];
}

// ─── Divide array em chunks para contornar limite de 10 do Firestore "in" ────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Busca anúncios do marketplace com paginação ──────────────────────────────
export async function findMarketplaceParts({
  masterPartIds,
  limit,
  lastDocId,
  orderBy,
  orderDirection,
  minStock,
  condition,
  minWarranty,
}) {
  if (!masterPartIds.length) return { data: [], pagination: { hasMore: false } };

  const pageSize = limit || 10;
  const chunks = chunkArray(masterPartIds, 10);

  // Busca todos os chunks em paralelo
  const chunkResults = await Promise.all(
    chunks.map((chunk) => {
      let q = db
        .collection("marketplaceParts")
        .where("masterPartId", "in", chunk)
        .where("active", "==", true)
        .where("moderationStatus", "==", "approved");

      if (minStock) q = q.where("stock", ">=", Number(minStock));
      if (condition) q = q.where("condition", "==", condition);
      if (minWarranty) q = q.where("warrantyMonths", ">=", Number(minWarranty));

      return q.get();
    })
  );

  // Mescla e ordena todos os resultados
  let allDocs = chunkResults.flatMap((snap) =>
    snap.docs.map((doc) => ({ id: doc.id, ...doc.data(), _ref: doc }))
  );

  // Ordenação em memória após merge dos chunks
  const direction = orderDirection === "asc" ? 1 : -1;
  const field = orderBy || "createdAt";
  allDocs.sort((a, b) => {
    const av = a[field]?.toMillis?.() ?? a[field] ?? 0;
    const bv = b[field]?.toMillis?.() ?? b[field] ?? 0;
    return (av > bv ? 1 : av < bv ? -1 : 0) * direction;
  });

  // Paginação por cursor (lastDocId)
  if (lastDocId) {
    const idx = allDocs.findIndex((d) => d.id === lastDocId);
    if (idx !== -1) allDocs = allDocs.slice(idx + 1);
  }

  const page = allDocs.slice(0, pageSize);
  const lastVisible = page[page.length - 1];

  return {
    data: page.map(({ _ref, ...rest }) => rest),
    pagination: {
      hasMore: allDocs.length > pageSize,
      lastDocId: lastVisible ? lastVisible.id : null,
    },
  };
}

// ─── Busca masterParts por IDs (com batching) ─────────────────────────────────
export async function findMasterPartsByIds(ids) {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const chunks = chunkArray(unique, 10);

  const results = await Promise.all(
    chunks.map((chunk) =>
      db.collection("masterParts").where("__name__", "in", chunk).get()
    )
  );

  return results.flatMap((snap) =>
    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  );
}

// ─── Busca categorias por IDs (com batching) ──────────────────────────────────
export async function findCategoriesByIds(ids) {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const chunks = chunkArray(unique, 10);

  const results = await Promise.all(
    chunks.map((chunk) =>
      db.collection("categories").where("__name__", "in", chunk).get()
    )
  );

  return results.flatMap((snap) =>
    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  );
}
