import {
  findCompatiblePartIds,
  findMarketplaceParts,
  findMasterPartsByIds,
  findCategoriesByIds,
} from "../repositories/search.repository.js";

function normalize(text) {
  return text?.toString().toLowerCase().trim() ?? "";
}

function extractDisplacement(engine) {
  const match = normalize(engine).match(/^[\d.]+/);
  return match ? match[0] : normalize(engine);
}

export async function executeSearch(data) {
  const brandSlug = normalize(data.brand);
  const modelSlug = normalize(data.model);
  const engineDisplacement = extractDisplacement(data.engineDisplacement);
  const fuelNorm = normalize(data.fuelType);

  const masterPartIds = await findCompatiblePartIds({
    brandSlug,
    modelSlug,
    engineDisplacement,
    fuelNorm,
  });

  if (!masterPartIds.length)
    return { data: [], pagination: { hasMore: false } };

  const marketplaceResult = await findMarketplaceParts({
    masterPartIds,
    limit: data.limit,
    lastDocId: data.lastDocId,
    orderBy: data.orderBy,
    orderDirection: data.orderDirection,
    minStock: data.minStock,
    condition: data.condition,
    minWarranty: data.minWarranty,
  });

  if (!marketplaceResult.data.length)
    return { data: [], pagination: marketplaceResult.pagination };

  const masterParts = await findMasterPartsByIds(
    marketplaceResult.data.map((p) => p.masterPartId)
  );

  const categories = await findCategoriesByIds(
    masterParts.map((p) => p.categoryId).filter(Boolean)
  );

  const enrichedData = marketplaceResult.data.map((item) => {
    const part = masterParts.find((mp) => mp.id === item.masterPartId);
    const category = categories.find((c) => c.id === part?.categoryId);
    return {
      ...item,
      part: {
        id: part?.id ?? null,
        name: part?.name ?? null,
        oemNumber: part?.oemNumber ?? null,
        description: part?.description ?? null,
        images: part?.images ?? [],
        weightKg: part?.weightKg ?? 0,
        dimensions: part?.dimensions ?? null,
        brand: part?.brand ?? null,
        category: category?.name ?? null,
      },
    };
  });

  return { data: enrichedData, pagination: marketplaceResult.pagination };
}
