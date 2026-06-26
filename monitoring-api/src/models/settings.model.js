class Settings {
  constructor(data = {}) {
    this.id = data.id || null;
    this.device_id = data.device_id || 'esp32-001';
    this.soil_threshold = data.soil_threshold || 30;
    this.pump_max_duration = data.pump_max_duration || 20;
    this.pump_cooldown = data.pump_cooldown || 20;
    this.telegram_enabled = data.telegram_enabled !== undefined ? !!data.telegram_enabled : true;
    this.auto_water_enabled = data.auto_water_enabled !== undefined ? !!data.auto_water_enabled : true;
    this.updated_at = data.updated_at || null;
  }
}

class SettingsRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async get(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      'SELECT * FROM settings WHERE device_id = $1 LIMIT 1',
      [deviceId]
    );
    if (result.rows.length === 0) {
      const insertResult = await this.db.query(
        'INSERT INTO settings (device_id) VALUES ($1) RETURNING *',
        [deviceId]
      );
      return new Settings(insertResult.rows[0]);
    }
    return new Settings(result.rows[0]);
  }

  async update(settingsData, deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `INSERT INTO settings (device_id, soil_threshold, pump_max_duration, pump_cooldown, telegram_enabled, auto_water_enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (device_id) DO UPDATE SET
         soil_threshold = EXCLUDED.soil_threshold,
         pump_max_duration = EXCLUDED.pump_max_duration,
         pump_cooldown = EXCLUDED.pump_cooldown,
         telegram_enabled = EXCLUDED.telegram_enabled,
         auto_water_enabled = EXCLUDED.auto_water_enabled
       RETURNING id`,
      [
        deviceId,
        settingsData.soil_threshold,
        settingsData.pump_max_duration,
        settingsData.pump_cooldown,
        settingsData.telegram_enabled ? 1 : 0,
        settingsData.auto_water_enabled ? 1 : 0,
      ]
    );
    return result.rows[0].id;
  }
}

module.exports = { Settings, SettingsRepository };