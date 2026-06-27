const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  try {
    const logs = await getServices().logs.getAllLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logs', async (req, res) => {
  const { device_id, action = 'watering', duration_seconds = 0 } = req.body;
  try {
    const id = await getServices().logs.createWateringLog(
      duration_seconds,
      device_id || 'esp32-001',
      action
    );
    res.status(201).json({ id, message: 'Log tersimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await getServices().logs.getWeeklyStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
