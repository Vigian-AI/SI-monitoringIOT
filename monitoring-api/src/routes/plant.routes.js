const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const plant = await getServices().plant.getPlant();
    const sensor = await getServices().sensor.getLatestSensorData();
    res.json({
      ...plant,
      soil_moisture: sensor?.soil_moisture ?? null,
      temperature: sensor?.temperature ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const { name, species, image_url } = req.body;
  try {
    const plant = await getServices().plant.updatePlant({ name, species, image_url });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
