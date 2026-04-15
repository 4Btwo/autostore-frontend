import { getApplicationsByVehicle } from "../services/vehiclesApplications.service.js";

export async function listApplications(req, res) {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({ error: "vehicleId é obrigatório" });
    }

    const applications = await getApplicationsByVehicle(vehicleId);

    return res.json(applications);
  } catch (error) {
    console.error("Erro ao listar aplicações:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}