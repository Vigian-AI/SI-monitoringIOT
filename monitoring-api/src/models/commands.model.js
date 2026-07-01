class Command {
  constructor(data) {
    this.id = data.id || null;
    this.device_id = data.device_id || 'esp32-001';
    this.type = data.type || null;
    this.payload = data.payload || null;
    this.executed = data.executed || false;
    this.created_at = data.created_at || null;
  }
}

class CommandsRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async create(deviceId, type, payload = {}) {
    const result = await this.db.query(
      `INSERT INTO commands (device_id, type, payload)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [deviceId || this.defaultDeviceId, type, payload]
    );
    return result.rows[0].id;
  }

  async getPending(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `SELECT * FROM commands
       WHERE device_id = $1 AND executed = FALSE
       ORDER BY created_at ASC LIMIT 10`,
      [deviceId]
    );
    return result.rows.map((row) => new Command(row));
  }

  async markExecuted(id) {
    await this.db.query(
      `UPDATE commands SET executed = TRUE WHERE id = $1`,
      [id]
    );
  }

  async clearExecuted() {
    await this.db.query(
      `DELETE FROM commands WHERE executed = TRUE AND created_at < NOW() - INTERVAL '1 day'`
    );
  }
}

module.exports = { Command, CommandsRepository };