const { CommandsRepository } = require('../models/commands.model');

class CommandsService {
  constructor(db) {
    this.repository = new CommandsRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async createWateringCommand(duration, deviceId = this.defaultDeviceId) {
    return await this.repository.create(deviceId, 'watering', { duration });
  }

  async getPendingCommands(deviceId = this.defaultDeviceId) {
    return await this.repository.getPending(deviceId);
  }

  async acknowledgeCommand(commandId) {
    await this.repository.markExecuted(commandId);
  }
}

module.exports = CommandsService;