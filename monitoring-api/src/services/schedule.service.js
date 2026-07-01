const { ScheduleRepository } = require('../models/schedule.model');
const { getServices } = require('../services');

class ScheduleService {
  constructor(db) {
    this.repository = new ScheduleRepository(db);
    this.defaultDeviceId = 'esp32-001';
  }

  async getAll(deviceId = this.defaultDeviceId) {
    return await this.repository.ensureDefaults(deviceId);
  }

  async create(data, deviceId = this.defaultDeviceId) {
    return await this.repository.create(data, deviceId);
  }

  async update(id, data) {
    return await this.repository.update(id, data);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  getNextSchedule(schedules) {
    const enabled = schedules.filter((s) => s.enabled);
    if (enabled.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let next = null;
    let minDiff = Infinity;

    for (const schedule of enabled) {
      const [h, m] = schedule.time.split(':').map(Number);
      const scheduleMinutes = h * 60 + m;
      let diff = scheduleMinutes - currentMinutes;
      if (diff <= 0) diff += 24 * 60;
      if (diff < minDiff) {
        minDiff = diff;
        next = schedule;
      }
    }

    return next;
  }

  async triggerScheduledWatering() {
    const schedules = await this.getAll();
    const next = this.getNextSchedule(schedules);

    if (next) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [h, m] = next.time.split(':').map(Number);
      const scheduleMinutes = h * 60 + m;
      let diff = scheduleMinutes - currentMinutes;
      if (diff <= 0) diff += 24 * 60;

      if (diff < 2) {
        try {
          console.log(`[SCHEDULE] Triggering schedule: ${next.label} (${next.duration_minutes} min)`);
          await getServices().commands.createWateringCommand(
            next.duration_minutes * 60,
            next.device_id
          );
        } catch (error) {
          console.error('Failed to create watering command:', error);
        }
      }
    }
  }
}

module.exports = ScheduleService;