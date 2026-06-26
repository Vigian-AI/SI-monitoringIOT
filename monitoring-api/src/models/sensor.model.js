class Sensor {
  constructor(data) {
    this.id = data.id || null;
    this.device_id = data.device_id || 'esp32-001';
    this.temperature = data.temperature;
    this.humidity = data.humidity;
    this.light_intensity = data.light_intensity;
    this.soil_moisture = data.soil_moisture;
    this.pump_status = data.pump_status ? 1 : 0;
    this.created_at = data.created_at || null;
  }
}

class SensorRepository {
  constructor(db) {
    this.db = db;
  }

  async save(sensorData) {
    const result = await this.db.query(
      `INSERT INTO sensor_data (device_id, temperature, humidity, light_intensity, soil_moisture, pump_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [sensorData.device_id, sensorData.temperature, sensorData.humidity, sensorData.light_intensity, sensorData.soil_moisture, sensorData.pump_status]
    );
    return result.rows[0].id;
  }

  async getLatest() {
    const result = await this.db.query(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1'
    );
    return result.rows[0] || null;
  }

  async getAll(limit = 50) {
    const result = await this.db.query(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }
}

module.exports = { Sensor, SensorRepository };