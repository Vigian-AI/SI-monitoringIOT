const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.get('/sensor/latest', async (req, res) => {
  try {
    const data = await getServices().sensor.getLatestSensorData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sensor', async (req, res) => {
  const {
    device_id,
    temperature,
    humidity,
    light_intensity,
    soil_moisture,
    pump_status,
    wifi_ssid,
    rssi,
    firmware_version,
  } = req.body;

  try {
    const id = await getServices().sensor.saveSensorData({
      device_id,
      temperature,
      humidity,
      light_intensity,
      soil_moisture,
      pump_status,
      wifi_ssid,
      rssi,
      firmware_version,
    });
    res.status(201).json({ id, message: 'Data tersimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const data = await getServices().sensor.getAllSensorData(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/watering', async (req, res) => {
  const { duration = 20 } = req.body;
  try {
    const id = await getServices().logs.createWateringLog(duration);
    res.status(201).json({ id, message: 'Watering started', duration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;