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
    const result = await db.query(
      `INSERT INTO sensor_data (device_id, temperature, humidity, light_intensity, soil_moisture, pump_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [device_id || 'esp32-001', temperature, humidity, light_intensity, soil_moisture, pump_status ? 1 : 0]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Data tersimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const db = getDB();
    const rowsResult = await db.query(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(rowsResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensor/latest', async (req, res) => {
  try {
    const db = getDB();
    const rowsResult = await db.query(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1'
    );
    res.json(rowsResult.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
