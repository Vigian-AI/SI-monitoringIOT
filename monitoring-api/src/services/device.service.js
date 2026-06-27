const { DeviceRepository } = require('../models/device.model');

const ONLINE_THRESHOLD_SECONDS = 30;

class DeviceService {
  constructor(db) {
    this.repository = new DeviceRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async recordHeartbeat(deviceId, meta = {}) {
    await this.repository.upsertHeartbeat(deviceId || this.defaultDeviceId, meta);
  }

  async getStatus(deviceId = this.defaultDeviceId) {
    await this.repository.ensureDefault(deviceId);
    const device = await this.repository.get(deviceId);
    if (!device) {
      return {
        device_id: deviceId,
        name: 'Floratech Hub ESP32',
        online: false,
        last_seen_at: null,
        wifi_ssid: null,
        rssi: null,
        firmware_version: null,
      };
    }

    const lastSeen = device.last_seen_at ? new Date(device.last_seen_at) : null;
    const secondsSince = lastSeen ? (Date.now() - lastSeen.getTime()) / 1000 : Infinity;

    return {
      device_id: device.device_id,
      name: device.name,
      online: secondsSince <= ONLINE_THRESHOLD_SECONDS,
      last_seen_at: device.last_seen_at,
      wifi_ssid: device.wifi_ssid,
      rssi: device.rssi,
      firmware_version: device.firmware_version || '1.0.0',
      seconds_since_last_seen: lastSeen ? Math.round(secondsSince) : null,
    };
  }
}

module.exports = DeviceService;
