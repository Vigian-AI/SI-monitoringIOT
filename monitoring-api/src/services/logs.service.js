const { LogsRepository } = require('../models/logs.model');

class LogsService {
  constructor(db) {
    this.repository = new LogsRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async createWateringLog(duration, deviceId = this.defaultDeviceId) {
    return await this.repository.create('watering', duration, deviceId);
  }

  async getAllLogs(limit = 20) {
    return await this.repository.getAll(limit);
  }
}

module.exports = LogsService;