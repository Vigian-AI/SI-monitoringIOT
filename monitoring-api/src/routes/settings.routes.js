const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const settings = await getServices().settings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const { soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled } = req.body;

  try {
    const id = await getServices().settings.updateSettings({
      soil_threshold,
      pump_max_duration,
      pump_cooldown,
      telegram_enabled,
      auto_water_enabled,
    });
    res.json({ id, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;