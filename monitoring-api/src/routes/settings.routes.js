const express = require('express');
const { getDB } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM settings WHERE device_id = ? LIMIT 1',
      ['esp32-001']
    );
    if (rows.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO settings (device_id) VALUES (?)',
        ['esp32-001']
      );
      const [newRows] = await db.execute('SELECT * FROM settings WHERE id = ?', [result.insertId]);
      res.json(newRows[0]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const { soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled } = req.body;
  try {
    const db = getDB();
    await db.execute(
      'INSERT INTO settings (device_id, soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE soil_threshold = VALUES(soil_threshold), pump_max_duration = VALUES(pump_max_duration), pump_cooldown = VALUES(pump_cooldown), telegram_enabled = VALUES(telegram_enabled), auto_water_enabled = VALUES(auto_water_enabled)',
      ['esp32-001', soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled ? 1 : 0, auto_water_enabled ? 1 : 0]
    );
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
