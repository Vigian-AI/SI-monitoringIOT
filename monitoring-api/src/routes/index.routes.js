const express = require('express');
const { getDB } = require('../config/database');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.post('/sensor', async (req, res) => {
  const { device_id, temperature, humidity, light_intensity, soil_moisture, pump_status } = req.body;

  try {
    const db = getDB();
    const [result] = await db.execute(
      'INSERT INTO sensor_data (device_id, temperature, humidity, light_intensity, soil_moisture, pump_status) VALUES (?, ?, ?, ?, ?, ?)',
      [device_id || 'esp32-001', temperature, humidity, light_intensity, soil_moisture, pump_status ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Data tersimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor/latest', async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
