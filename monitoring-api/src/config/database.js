const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = null;
    this.config = this.loadConfig();
  }

  loadConfig() {
    const getStringEnv = (name, fallback) => {
      const value = process.env[name];
      if (typeof value === 'string' && value.trim() !== '') return value.trim();
      return fallback;
    };

    const getNumberEnv = (name, fallback) => {
      const value = process.env[name];
      const parsed = Number.parseInt(value || '', 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

    return process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: getStringEnv('DB_HOST', 'localhost'),
          user: getStringEnv('DB_USER', 'postgres'),
          password: getStringEnv('DB_PASSWORD', 'postgres'),
          database: getStringEnv('DB_NAME', 'smart_farming'),
          port: getNumberEnv('DB_PORT', 5432),
          max: getNumberEnv('DB_POOL_SIZE', 10),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };
  }

  async connect() {
    this.pool = new Pool(this.config);
    await this.pool.query('SELECT NOW()');
    console.log('Terhubung ke database PostgreSQL:', this.config.database || this.config.connectionString);
  }

  async initTables() {
    if (!this.pool) throw new Error('Database belum terhubung');

    const statements = [
      `CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
        temperature NUMERIC(4,1) NOT NULL,
        humidity NUMERIC(4,1) NOT NULL,
        light_intensity INT NOT NULL,
        soil_moisture INT NOT NULL,
        pump_status SMALLINT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sensor_data_device_created ON sensor_data (device_id, created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS watering_logs (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
        action VARCHAR(20) NOT NULL,
        duration_seconds INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_watering_logs_device_created ON watering_logs (device_id, created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
        soil_threshold INT NOT NULL DEFAULT 30,
        pump_max_duration INT NOT NULL DEFAULT 20,
        pump_cooldown INT NOT NULL DEFAULT 20,
        telegram_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        auto_water_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_settings_device UNIQUE (device_id)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_settings_device ON settings (device_id)`,
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`,
      `CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL DEFAULT 'Floratech Hub ESP32',
        last_seen_at TIMESTAMPTZ,
        wifi_ssid VARCHAR(100),
        rssi INT,
        firmware_version VARCHAR(20),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL DEFAULT 'Monstera',
        species VARCHAR(100),
        image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
        label VARCHAR(50) NOT NULL,
        time VARCHAR(5) NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 15,
        days_of_week VARCHAR(50) NOT NULL DEFAULT 'daily',
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        icon VARCHAR(30) DEFAULT 'light_mode',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_schedules_device ON schedules (device_id)`,
      `CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`,
      `DROP TRIGGER IF EXISTS set_settings_updated_at ON settings`,
      `CREATE TRIGGER set_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
      `DROP TRIGGER IF EXISTS set_users_updated_at ON users`,
      `CREATE TRIGGER set_users_updated_at
         BEFORE UPDATE ON users
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
`ALTER TABLE plants
        DROP CONSTRAINT IF EXISTS fk_plants_device`,
      `ALTER TABLE plants
        ADD CONSTRAINT fk_plants_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE`,
      `ALTER TABLE settings
        DROP CONSTRAINT IF EXISTS fk_settings_device`,
      `ALTER TABLE settings
        ADD CONSTRAINT fk_settings_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE`,
      `ALTER TABLE sensor_data
        DROP CONSTRAINT IF EXISTS fk_sensor_device`,
      `ALTER TABLE sensor_data
        ADD CONSTRAINT fk_sensor_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE`,
      `ALTER TABLE schedules
        DROP CONSTRAINT IF EXISTS fk_schedule_device`,
      `ALTER TABLE schedules
        ADD CONSTRAINT fk_schedule_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE`,
      `ALTER TABLE watering_logs
        DROP CONSTRAINT IF EXISTS fk_watering_device`,
      `ALTER TABLE watering_logs
        ADD CONSTRAINT fk_watering_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE`,
    ];

    for (const statement of statements) {
      await this.pool.query(statement);
    }

    console.log('Tabel database siap');
  }

  getDB() {
    if (!this.pool) throw new Error('Database belum terhubung');
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

const database = new Database();

module.exports = {
  connect: () => database.connect(),
  initTables: () => database.initTables(),
  getDB: () => database.getDB(),
  close: () => database.close(),
  Database,
};