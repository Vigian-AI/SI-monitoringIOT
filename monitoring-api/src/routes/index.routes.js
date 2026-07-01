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

router.get('/sensor/pending', async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const commands = await getServices().commands.getPendingCommands();
    res.json(commands.slice(0, parseInt(limit)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/device/heartbeat', async (req, res) => {
  const { device_id, wifi_ssid, rssi, firmware_version } = req.body;
  try {
    await getServices().device.recordHeartbeat(device_id, { wifi_ssid, rssi, firmware_version });
    res.json({ message: 'Heartbeat recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/command/ack', async (req, res) => {
  const { device_id, command_id } = req.body;
  try {
    await getServices().commands.acknowledgeCommand(command_id);
    res.json({ message: 'Command acknowledged' });
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
  const { duration = 20, device_id } = req.body;
  try {
    const id = await getServices().commands.createWateringCommand(duration, device_id);
    res.status(201).json({ id, message: 'Perintah penyiraman dikirim ke ESP32', duration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;