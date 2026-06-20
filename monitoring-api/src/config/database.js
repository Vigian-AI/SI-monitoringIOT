const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_farming',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let db = null;

async function connect() {
  db = await mysql.createConnection(dbConfig);
  console.log('Terhubung ke database MySQL:', dbConfig.database);
}

async function initTables() {
  if (!db) throw new Error('Database belum terhubung');

  await db.query(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(50) DEFAULT 'esp32-001',
      temperature DECIMAL(4,1) NOT NULL,
      humidity DECIMAL(4,1) NOT NULL,
      light_intensity INT NOT NULL,
      soil_moisture INT NOT NULL,
      pump_status TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_created (device_id, created_at)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS watering_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(50) DEFAULT 'esp32-001',
      action VARCHAR(20) NOT NULL,
      duration_seconds INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_created (device_id, created_at)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(50) DEFAULT 'esp32-001',
      soil_threshold INT DEFAULT 30,
      pump_max_duration INT DEFAULT 20,
      pump_cooldown INT DEFAULT 20,
      telegram_enabled TINYINT(1) DEFAULT 1,
      auto_water_enabled TINYINT(1) DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_device (device_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email)
    )
  `);

  console.log('Tabel database siap');
}

function getDB() {
  if (!db) throw new Error('Database belum terhubung');
  return db;
}

module.exports = { connect, initTables, getDB, dbConfig };
