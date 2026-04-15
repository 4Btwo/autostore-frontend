export async function listByVehicle(vehicleId, filters = {}) {
  let query = db
    .collection("compatibilities")
    .where("vehicleId", "==", vehicleId)
    .where("active", "==", true);

  if (filters.engine) {
    query = query.where("engine", "==", filters.engine);
  }

  if (filters.application) {
    query = query.where("application", "==", filters.application);
  }

  const snap = await query.get();
  if (snap.empty) return [];

  const compatibilities = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // 🔹 IDs únicos
  const partIds = [...new Set(compatibilities.map(c => c.partId))];
  const vehicleIds = [...new Set(compatibilities.map(c => c.vehicleId))];

  // 🔹 Buscar partes em paralelo
  const partsDocs = await Promise.all(
    partIds.map(id => db.collection("parts").doc(id).get())
  );

  const partsMap = {};
  const categoryIds = new Set();

  partsDocs.forEach(doc => {
    if (!doc.exists) return;
    partsMap[doc.id] = doc.data();
    categoryIds.add(doc.data().categoryId);
  });

  // 🔹 Buscar categorias
  const categoriesDocs = await Promise.all(
    [...categoryIds].map(id => db.collection("categories").doc(id).get())
  );

  const categoriesMap = {};
  categoriesDocs.forEach(doc => {
    if (doc.exists) categoriesMap[doc.id] = doc.data();
  });

  // 🔹 Buscar veículos
  const vehiclesDocs = await Promise.all(
    vehicleIds.map(id => db.collection("vehicles").doc(id).get())
  );

  const vehiclesMap = {};
  const modelIds = new Set();
  const brandIds = new Set();

  vehiclesDocs.forEach(doc => {
    if (!doc.exists) return;
    vehiclesMap[doc.id] = doc.data();
    modelIds.add(doc.data().modelId);
    brandIds.add(doc.data().brandId);
  });

  // 🔹 Buscar modelos
  const modelsDocs = await Promise.all(
    [...modelIds].map(id => db.collection("models").doc(id).get())
  );

  const modelsMap = {};
  modelsDocs.forEach(doc => {
    if (doc.exists) modelsMap[doc.id] = doc.data();
  });

  // 🔹 Buscar marcas
  const brandsDocs = await Promise.all(
    [...brandIds].map(id => db.collection("brands").doc(id).get())
  );

  const brandsMap = {};
  brandsDocs.forEach(doc => {
    if (doc.exists) brandsMap[doc.id] = doc.data();
  });

  // 🔹 Montar resposta final
  return compatibilities.map(c => {
    const part = partsMap[c.partId];
    const category = part ? categoriesMap[part.categoryId] : null;
    const vehicle = vehiclesMap[c.vehicleId];
    const model = vehicle ? modelsMap[vehicle.modelId] : null;
    const brand = vehicle ? brandsMap[vehicle.brandId] : null;

    return {
      id: c.id,
      part: part
        ? {
            id: c.partId,
            name: part.name,
            sku: part.sku,
            stock: part.stock,
            category: category ? category.name : null
          }
        : null,
      vehicle: vehicle
        ? {
            brand: brand ? brand.name : null,
            model: model ? model.name : null,
            version: vehicle.version,
            engine: vehicle.engine,
            fuelType: vehicle.fuelType,
            yearStart: vehicle.yearStart,
            yearEnd: vehicle.yearEnd
          }
        : null
    };
  });
}