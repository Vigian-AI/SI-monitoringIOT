const express = require('express');
const { getDB } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const rowsResult = await db.query(
      'SELECT * FROM settings WHERE device_id = $1 LIMIT 1',
      ['esp32-001']
    );
    if (rowsResult.rows.length === 0) {
      const result = await db.query(
        'INSERT INTO settings (device_id) VALUES ($1) RETURNING *',
        ['esp32-001']
      );
      res.json(result.rows[0]);
    } else {
      res.json(rowsResult.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const { soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled } = req.body;
  try {
    const db = getDB();
    const result = await db.query(
      `INSERT INTO settings (device_id, soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (device_id) DO UPDATE SET
         soil_threshold = EXCLUDED.soil_threshold,
         pump_max_duration = EXCLUDED.pump_max_duration,
         pump_cooldown = EXCLUDED.pump_cooldown,
         telegram_enabled = EXCLUDED.telegram_enabled,
         auto_water_enabled = EXCLUDED.auto_water_enabled
       RETURNING id`,
      ['esp32-001', soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled ? 1 : 0, auto_water_enabled ? 1 : 0]
    );
    res.json({ id: result.rows[0].id, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
