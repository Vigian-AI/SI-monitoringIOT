class PlantRepository {
  constructor(db) {
    this.db = db;
    this.defaultDeviceId = 'esp32-001';
  }

  async get(deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      'SELECT * FROM plants WHERE device_id = $1 LIMIT 1',
      [deviceId]
    );
    return result.rows[0] || null;
  }

  async ensureDefault(deviceId = this.defaultDeviceId) {
    const existing = await this.get(deviceId);
    if (existing) return existing;

    const result = await this.db.query(
      `INSERT INTO plants (device_id, name, species, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        deviceId,
        'tomat',
        'tomat merah',
        'https://cdn.pixabay.com/photo/2015/10/05/22/25/funny-973458_1280.jpg',
      ]
    );
    return result.rows[0];
  }

  async update(data, deviceId = this.defaultDeviceId) {
    const result = await this.db.query(
      `UPDATE plants SET name = $2, species = $3, image_url = $4, updated_at = NOW()
       WHERE device_id = $1
       RETURNING *`,
      [deviceId, data.name, data.species, data.image_url]
    );
    return result.rows[0] || null;
  }
}

module.exports = { PlantRepository };
