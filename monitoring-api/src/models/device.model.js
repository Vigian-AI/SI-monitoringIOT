class DeviceRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async upsertHeartbeat(deviceId, { wifi_ssid, rssi, firmware_version } = {}) {
    const id = deviceId || this.defaultDeviceId;
    await this.db.query(
      `INSERT INTO devices (device_id, name, last_seen_at, wifi_ssid, rssi, firmware_version)
       VALUES ($1, $2, NOW(), $3, $4, $5)
       ON CONFLICT (device_id) DO UPDATE SET
         last_seen_at = NOW(),
         wifi_ssid = COALESCE(EXCLUDED.wifi_ssid, devices.wifi_ssid),
         rssi = COALESCE(EXCLUDED.rssi, devices.rssi),
         firmware_version = COALESCE(EXCLUDED.firmware_version, devices.firmware_version)`,
      [id, 'Floratech Hub ESP32', wifi_ssid || null, rssi ?? null, firmware_version || null]
    );
  }

  async get(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      'SELECT * FROM devices WHERE device_id = $1 LIMIT 1',
      [deviceId]
    );
    return result.rows[0] || null;
  }

  async ensureDefault(deviceId = this.defaultDeviceId) {
    await this.db.query(
      `INSERT INTO devices (device_id, name) VALUES ($1, $2)
       ON CONFLICT (device_id) DO NOTHING`,
      [deviceId, 'Floratech Hub ESP32']
    );
  }
}

module.exports = { DeviceRepository };
