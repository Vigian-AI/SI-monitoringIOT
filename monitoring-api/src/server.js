const express = require('express');
const cors = require('cors');
const { connect, initTables } = require('./config/database');
const indexRoutes = require('./routes/index.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);

async function start() {
  try {
    await connect();
    await initTables();
  } catch (err) {
    console.error('Gagal inisialisasi database:', err.message);
    console.log('Server tetap berjalan tanpa database');
  }

  app.listen(port, () => {
    console.log(`Smart Farming API berjalan di http://localhost:${port}`);
  });
}

start();
