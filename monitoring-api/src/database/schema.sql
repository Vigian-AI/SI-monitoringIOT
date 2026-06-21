CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
  temperature NUMERIC(4,1) NOT NULL,
  humidity NUMERIC(4,1) NOT NULL,
  light_intensity INT NOT NULL,
  soil_moisture INT NOT NULL,
  pump_status SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_device_created ON sensor_data (device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS watering_logs (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
  action VARCHAR(20) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watering_logs_device_created ON watering_logs (device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL DEFAULT 'esp32-001',
  soil_threshold INT NOT NULL DEFAULT 30,
  pump_max_duration INT NOT NULL DEFAULT 20,
  pump_cooldown INT NOT NULL DEFAULT 20,
  telegram_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_water_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_settings_device UNIQUE (device_id)
);

CREATE INDEX IF NOT EXISTS idx_settings_device ON settings (device_id);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_settings_updated_at ON settings;
CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

