const express = require('express');
const cors = require('cors');
const { connect, initTables, getDB } = require('./config/database');
const { authMiddleware } = require('./middleware/auth');
const SensorService = require('./services/sensor.service');
const SettingsService = require('./services/settings.service');
const LogsService = require('./services/logs.service');
const authRoutes = require('./routes/auth.routes');
const indexRoutes = require('./routes/index.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);

let services = {};

function createServices(db) {
  services = {
    sensor: new SensorService(db),
    settings: new SettingsService(db),
    logs: new LogsService(db),
  };
  return services;
}

app.use((req, res) => {
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

module.exports = { services, createServices };