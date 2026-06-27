class ScheduleRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async getAll(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      'SELECT * FROM schedules WHERE device_id = $1 ORDER BY time ASC',
      [deviceId]
    );
    return result.rows;
  }

  async getById(id) {
    const result = await this.db.query('SELECT * FROM schedules WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(data, deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `INSERT INTO schedules (device_id, label, time, duration_minutes, days_of_week, enabled, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        deviceId,
        data.label,
        data.time,
        data.duration_minutes || 15,
        data.days_of_week || 'daily',
        data.enabled !== false,
        data.icon || 'light_mode',
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const result = await this.db.query(
      `UPDATE schedules SET
         label = COALESCE($2, label),
         time = COALESCE($3, time),
         duration_minutes = COALESCE($4, duration_minutes),
         days_of_week = COALESCE($5, days_of_week),
         enabled = COALESCE($6, enabled),
         icon = COALESCE($7, icon),
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.label, data.time, data.duration_minutes, data.days_of_week, data.enabled, data.icon]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.db.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async ensureDefaults(deviceId = this.defaultDeviceId) {
    const existing = await this.getAll(deviceId);
    if (existing.length > 0) return existing;

    await this.create({ label: 'Pagi', time: '07:00', duration_minutes: 15, days_of_week: 'daily', icon: 'light_mode' }, deviceId);
    await this.create({ label: 'Sore', time: '18:00', duration_minutes: 10, days_of_week: 'mon,wed,fri', icon: 'dark_mode' }, deviceId);
    return this.getAll(deviceId);
  }
}

module.exports = { ScheduleRepository };
