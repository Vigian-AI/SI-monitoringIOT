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

  async getWeeklyStats(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `SELECT
         COUNT(*)::int AS total_sessions,
         COALESCE(SUM(duration_seconds), 0)::int AS total_seconds
       FROM watering_logs
       WHERE device_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'`,
      [deviceId]
    );
    const row = result.rows[0];
    const litersEstimate = (row.total_seconds * 0.05).toFixed(1);
    return {
      total_sessions: row.total_sessions,
      total_seconds: row.total_seconds,
      liters_estimate: parseFloat(litersEstimate),
    };
  }
}

module.exports = { WateringLog, LogsRepository };