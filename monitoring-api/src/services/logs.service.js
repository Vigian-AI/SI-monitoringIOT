const { LogsRepository } = require('../models/logs.model');

class LogsService {
  constructor(db) {
    this.repository = new LogsRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async createWateringLog(duration, deviceId = this.defaultDeviceId, action = 'watering') {
    return await this.repository.create(action, duration, deviceId);
  }

  async getAllLogs(limit = 20) {
    return await this.repository.getAll(limit);
  }

  async getWeeklyStats(deviceId = this.defaultDeviceId) {
    return await this.repository.getWeeklyStats(deviceId);
  }
}

module.exports = LogsService;