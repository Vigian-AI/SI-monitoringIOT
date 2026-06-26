const express = require('express');
const { services } = require('../server');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.get('/sensor/latest', async (req, res) => {
  try {
    const data = await services.sensor.getLatestSensorData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sensor', async (req, res) => {
  const { device_id, temperature, humidity, light_intensity, soil_moisture, pump_status } = req.body;

  try {
    const id = await services.sensor.saveSensorData({
      device_id,
      temperature,
      humidity,
      light_intensity,
      soil_moisture,
      pump_status,
    });
    res.status(201).json({ id, message: 'Data tersimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const data = await services.sensor.getAllSensorData(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/watering', async (req, res) => {
  const { duration = 20 } = req.body;
  try {
    const id = await services.logs.createWateringLog(duration);
    res.status(201).json({ id, message: 'Watering started', duration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;