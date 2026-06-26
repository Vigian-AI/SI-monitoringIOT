const { SettingsRepository } = require('../models/settings.model');

class SettingsService {
  constructor(db) {
    this.repository = new SettingsRepository(db);
  }

  async getSettings(deviceId = 'esp32-001') {
    return await this.repository.get(deviceId);
  }

  async updateSettings(data, deviceId = 'esp32-001') {
    const settings = {
      soil_threshold: data.soil_threshold,
      pump_max_duration: data.pump_max_duration,
      pump_cooldown: data.pump_cooldown,
      telegram_enabled: data.telegram_enabled,
      auto_water_enabled: data.auto_water_enabled,
    };
    return await this.repository.update(settings, deviceId);
  }
}

module.exports = SettingsService;