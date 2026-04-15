// ─── API Brasil — Consulta de Placa ───────────────────────────────────────────
// Quando APIBRASIL_DEVICE_TOKEN estiver configurado, usa a API real.
// Caso contrário, retorna mock inteligente para demonstração.

const BEARER_TOKEN = process.env.APIBRASIL_BEARER_TOKEN;
const DEVICE_TOKEN = process.env.APIBRASIL_DEVICE_TOKEN;

// Mock com placas reais de demonstração
const MOCK_DB = {
  default: { brand: "Volkswagen", model: "Gol", year: 2019, engine: "1.0 Flex", fuel: "Flex", color: "Branco" },
  "ABC1234": { brand: "Volkswagen", model: "Gol", year: 2019, engine: "1.0 Flex", fuel: "Flex", color: "Branco" },
  "BRA2E19": { brand: "Fiat", model: "Argo", year: 2022, engine: "1.3 Flex", fuel: "Flex", color: "Prata" },
  "DEF5678": { brand: "Chevrolet", model: "Onix", year: 2020, engine: "1.0 Turbo", fuel: "Flex", color: "Preto" },
  "GHI9012": { brand: "Toyota", model: "Corolla", year: 2021, engine: "2.0 Flex", fuel: "Flex", color: "Branco" },
  "JKL3456": { brand: "Honda", model: "Civic", year: 2018, engine: "1.5 Turbo", fuel: "Gasolina", color: "Cinza" },
  "MNO7890": { brand: "Ford", model: "Ka", year: 2017, engine: "1.0 Flex", fuel: "Flex", color: "Vermelho" },
};

export const getVehicleByPlate = async (plate) => {
  const normalized = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // Se tiver device token, usa API real
  if (BEARER_TOKEN && DEVICE_TOKEN) {
    try {
      const response = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/fipe/dados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BEARER_TOKEN}`,
          "DeviceToken": DEVICE_TOKEN,
        },
        body: JSON.stringify({ placa: normalized }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || "Erro na API Brasil");
      }

      const v = data.response || data;
      return {
        plate: normalized,
        brand: v.MARCA || v.marca,
        model: v.MODELO || v.modelo,
        year: v.anoModelo || v.ano_modelo || v.ANO,
        engine: v.motor || v.MOTOR || null,
        fuel: v.combustivel || v.COMBUSTIVEL || null,
        color: v.cor || v.COR || null,
      };
    } catch (err) {
      console.error("Erro API Brasil, usando mock:", err.message);
    }
  }

  // Mock de demonstração
  console.log(`🔧 [MOCK] Placa ${normalized} — configure APIBRASIL_DEVICE_TOKEN para dados reais`);
  const mock = MOCK_DB[normalized] || MOCK_DB.default;
  return { plate: normalized, ...mock };
};


//APIBRASIL_BEARER_TOKENeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dhdGV3YXkuYXBpYnJhc2lsL
//mlvL2FwaS9vYXV0aC9leGNoYW5nZSIsImlhdCI6MTc3MzI2OTU3NywiZXhwIjoxODA0ODA1NTc3LCJuYmYiOjE3NzMyNjk1NzcsImp0aS
//I6IkxINUJqQ2pQZHNueGVrZUIiLCJzdWIiOiIyMjA2MiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2
//ZjciLCJ1c2VyX2lkIjoxNjM2NCwiZW1haWwiOiJhcnR1ci51bWJlbGlub0BhcGlicmFzaWwuY29tLmJyIn0._vZdUw8Mtj9mVfVeGaPSR-06S_4MZyTy5Cec45IG3JQAPIBRASIL_DEVICE_TOKEN(pegar no painel após assinar)
