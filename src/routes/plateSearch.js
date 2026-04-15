import express from "express";

const router = express.Router();

router.get("/:plate", async (req, res) => {

  const { plate } = req.params;

  const vehicles = {
    "ABC1D23": {
      brand: "Volkswagen",
      model: "Gol",
      year: 2018,
      engine: "1.6 MSI",
      fuel: "Flex"
    },
    "BRA2E19": {
      brand: "Chevrolet",
      model: "Onix",
      year: 2020,
      engine: "1.4",
      fuel: "Flex"
    },
    "CAR9X00": {
      brand: "Fiat",
      model: "Uno",
      year: 2016,
      engine: "1.0",
      fuel: "Flex"
    }
  };

  const vehicle = vehicles[plate.toUpperCase()];

  if (!vehicle) {
    return res.status(404).json({
      message: "Veículo não encontrado"
    });
  }

  res.json(vehicle);

});

export default router;