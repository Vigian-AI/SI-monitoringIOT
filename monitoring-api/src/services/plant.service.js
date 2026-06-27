const { PlantRepository } = require('../models/plant.model');

class PlantService {
  constructor(db) {
    this.repository = new PlantRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async getPlant(deviceId = this.defaultDeviceId) {
    return await this.repository.ensureDefault(deviceId);
  }

  async updatePlant(data, deviceId = this.defaultDeviceId) {
    await this.repository.ensureDefault(deviceId);
    return await this.repository.update(data, deviceId);
  }
}

module.exports = PlantService;
