require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connect, initTables, getDB } = require('./config/database');
const { setServices } = require('./services');
const SensorService = require('./services/sensor.service');
const SettingsService = require('./services/settings.service');
const LogsService = require('./services/logs.service');
const DeviceService = require('./services/device.service');
const PlantService = require('./services/plant.service');
const ScheduleService = require('./services/schedule.service');
const authRoutes = require('./routes/auth.routes');
const indexRoutes = require('./routes/index.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');
const deviceRoutes = require('./routes/device.routes');
const plantRoutes = require('./routes/plant.routes');
const scheduleRoutes = require('./routes/schedule.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/plant', plantRoutes);
app.use('/api/schedules', scheduleRoutes);

function createServices(db) {
  const device = new DeviceService(db);
  const sensor = new SensorService(db);
  sensor.setDeviceService(device);

  const services = {
    sensor,
    settings: new SettingsService(db),
    logs: new LogsService(db),
    device,
    plant: new PlantService(db),
    schedule: new ScheduleService(db),
  };
  setServices(services);
  return services;
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

async function start() {
  try {
    await connect();
    await initTables();
    createServices(getDB());
  } catch (err) {
    console.error('Gagal inisialisasi database:', err.message);
    console.log('Server tetap berjalan tanpa database');
  }

  app.listen(port, () => {
    console.log(`Smart Farming API berjalan di http://localhost:${port}`);
  });
}

start();

module.exports = { createServices };