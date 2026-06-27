const { SensorRepository } = require('../models/sensor.model');

class SensorService {
  constructor(db) {
    this.repository = new SensorRepository(db);
  }

  async saveSensorData(data) {
    const sensor = {
      device_id: data.device_id || 'esp32-001',
      temperature: data.temperature,
      humidity: data.humidity,
      light_intensity: data.light_intensity || 0,
      soil_moisture: data.soil_moisture || 0,
      pump_status: data.pump_status ? 1 : 0,
    };
    const id = await this.repository.save(sensor);
    if (this.deviceService) {
      await this.deviceService.recordHeartbeat(sensor.device_id, {
        wifi_ssid: data.wifi_ssid,
        rssi: data.rssi,
        firmware_version: data.firmware_version,
      });
    }
    return id;
  }

  setDeviceService(deviceService) {
    this.deviceService = deviceService;
  }

  async getLatestSensorData() {
    return await this.repository.getLatest();
  }

  async getAllSensorData(limit = 50) {
    return await this.repository.getAll(limit);
  }
}

module.exports = SensorService;