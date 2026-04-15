import { db, admin } from "../config/firebase.js";
import { SUBCOLLECTIONS } from "./desmanche.catalog.js";

// ─── Decodificação básica de VIN (17 chars) ──────────────────────────────────
// WMI (1-3): fabricante | VDS (4-9): veículo | VIS (10-17): seq + ano + planta
const WMI_BRANDS = {
  "9BW": "Volkswagen", "9BH": "Volkswagen", "9BF": "Ford",
  "9BD": "Fiat", "9BM": "Mercedes-Benz", "8AF": "Chevrolet",
  "8AC": "Chevrolet", "9BK": "Honda", "93H": "Honda",
  "9BS": "Toyota", "93Y": "Toyota", "9BR": "Renault",
  "93X": "Nissan", "9B3": "Citroën", "9B2": "Peugeot",
  "93R": "Jeep", "JTD": "Toyota", "WVW": "Volkswagen",
  "1FA": "Ford", "2FA": "Ford", "3FA": "Ford",
};

const VIN_YEAR = {
  "A":1980,"B":1981,"C":1982,"D":1983,"E":1984,"F":1985,"G":1986,"H":1987,
  "J":1988,"K":1989,"L":1990,"M":1991,"N":1992,"P":1993,"R":1994,"S":1995,
  "T":1996,"V":1997,"W":1998,"X":1999,"Y":2000,"1":2001,"2":2002,"3":2003,
  "4":2004,"5":2005,"6":2006,"7":2007,"8":2008,"9":2009,"A":2010,"B":2011,
  "C":2012,"D":2013,"E":2014,"F":2015,"G":2016,"H":2017,"J":2018,"K":2019,
  "L":2020,"M":2021,"N":2022,"P":2023,"R":2024,"S":2025,
};

function decodeVinLocally(vin) {
  const v = vin.toUpperCase().replace(/[IOQ]/g, "");
  if (v.length !== 17) return null;
  const wmi = v.substring(0, 3);
  const yearChar = v.charAt(9);
  const brand = WMI_BRANDS[wmi] || "Fabricante desconhecido";
  const year = VIN_YEAR[yearChar] || null;
  const seq = v.substring(11);
  return { vin: v, brand, year, wmi, seq };
}

// ─── Consulta ApiBrasil (quando Device Token estiver disponível) ──────────────
async function queryApiBrasilChassi(vin) {
  const BEARER = process.env.APIBRASIL_BEARER;
  const DEVICE = process.env.APIBRASIL_DEVICE_TOKEN;
  if (!BEARER || !DEVICE || DEVICE === "pendente") return null;

  try {
    const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/chassi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BEARER}`,
        "DeviceToken": DEVICE,
      },
      body: JSON.stringify({ chassi: vin }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Normalizar resposta da ApiBrasil
    const r = data?.data || data?.response || data;
    if (!r) return null;
    return {
      vin,
      brand: r.marca || r.MARCA || r.brand,
      model: r.modelo || r.MODELO || r.model,
      year: r.ano || r.ANO || r.year,
      engine: r.motor || r.MOTOR || r.engine,
      fuel: r.combustivel || r.COMBUSTIVEL || r.fuel,
      color: r.cor || r.COR || r.color,
      chassis: r.chassi || vin,
      source: "apibrasil",
    };
  } catch {
    return null;
  }
}

// ─── Consulta principal ───────────────────────────────────────────────────────
export async function lookupChassi(vin) {
  const vinClean = vin.toUpperCase().trim().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  if (vinClean.length !== 17) {
    throw new Error("Chassi inválido — deve ter exatamente 17 caracteres alfanuméricos");
  }

  // 1. Tentar cache no Firestore (30 dias)
  const cacheRef = db.collection("chassiCache").doc(vinClean);
  const cached = await cacheRef.get();
  if (cached.exists) {
    const data = cached.data();
    const age = Date.now() - data.cachedAt?.toMillis?.();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      return { ...data.vehicle, fromCache: true };
    }
  }

  // 2. Tentar ApiBrasil (paga)
  let vehicle = await queryApiBrasilChassi(vinClean);

  // 3. Fallback: decodificação local do VIN
  if (!vehicle) {
    const decoded = decodeVinLocally(vinClean);
    if (!decoded) throw new Error("Não foi possível decodificar o chassi");
    vehicle = {
      vin: vinClean,
      brand: decoded.brand,
      model: `Modelo ${decoded.seq}`,
      year: decoded.year,
      engine: null,
      fuel: null,
      color: null,
      chassis: vinClean,
      source: "local_decode",
      mock: true,
    };
  }

  // 4. Salvar no cache
  await cacheRef.set({ vehicle, cachedAt: admin.firestore.FieldValue.serverTimestamp() });

  return vehicle;
}

// ─── Gerar catálogo de peças do desmanche para um VIN ────────────────────────
export async function generateDesmancheCatalog(vin, vehicleData) {
  // Busca peças do masterParts compatíveis com marca/modelo no Firestore
  // Por enquanto retorna o catálogo completo estruturado por subcoleção
  // Quando a compatibilidade por VIN estiver mapeada, filtra aqui

  const catalog = SUBCOLLECTIONS.map(sub => ({
    id: sub.id,
    label: sub.label,
    icon: sub.icon,
    totalParts: sub.parts.length,
    parts: sub.parts.map(p => ({
      ...p,
      // Tentar encontrar OEM real no masterParts pela categoria
      categoryIds: sub.categoryIds,
      vehicle: vehicleData,
      condition: "used", // desmanche = peça usada por padrão
      price: 0,          // preço zerado para preencher depois
    })),
  }));

  return catalog;
}

// ─── Publicar anúncios em lote para subcoleções selecionadas ─────────────────
export async function publishDesmancheLot({ sellerId, vin, vehicleData, selectedSubcollections }) {
  const results = { created: 0, errors: [] };
  const batch = db.batch();

  for (const subId of selectedSubcollections) {
    const sub = SUBCOLLECTIONS.find(s => s.id === subId);
    if (!sub) continue;

    for (const part of sub.parts) {
      try {
        const docRef = db.collection("marketplaceParts").doc();
        batch.set(docRef, {
          sellerId,
          vin,
          vehicleBrand: vehicleData.brand || null,
          vehicleModel: vehicleData.model || null,
          vehicleYear: vehicleData.year || null,
          name: part.name,
          oemNumber: `${vin.substring(0, 8)}-${part.oemRef}`, // OEM baseado no VIN
          description: `Peça de desmanche — ${vehicleData.brand || ""} ${vehicleData.model || ""} ${vehicleData.year || ""}`.trim(),
          categoryId: sub.categoryIds[0] || null,
          subcollectionId: sub.id,
          subcollectionLabel: sub.label,
          condition: "used",
          price: 0,          // vendedor preenche depois
          stock: 1,
          warrantyMonths: 0,
          images: [],
          active: true,
          pendingPrice: true, // flag para lembrar de precificar
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        results.created++;
      } catch (err) {
        results.errors.push(`${part.name}: ${err.message}`);
      }
    }
  }

  await batch.commit();
  return results;
}
