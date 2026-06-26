class WateringLog {
  constructor(data) {
    this.id = data.id || null;
    this.device_id = data.device_id || 'esp32-001';
    this.action = data.action || 'watering';
    this.duration_seconds = data.duration_seconds || 0;
    this.created_at = data.created_at || null;
  }
}

class LogsRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async create(action, duration, deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `INSERT INTO watering_logs (device_id, action, duration_seconds)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [deviceId, action, duration]
    );
    return result.rows[0].id;
  }

  async getAll(limit = 20) {
    const result = await this.db.query(
      'SELECT * FROM watering_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.map((row) => new WateringLog(row));
  }
}

module.exports = { WateringLog, LogsRepository };