class User {
  constructor(data) {
    this.id = data.id || null;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash || null;
    this.role = data.role || 'user';
    this.is_active = data.is_active !== undefined ? !!data.is_active : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }
}

class UserRepository {
  constructor(db) {
    this.db = db;
  }

  async findByUsernameOrEmail(username, email) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  async create(userData) {
    const result = await this.db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role`,
      [userData.username, userData.email, userData.passwordHash]
    );
    return new User(result.rows[0]);
  }

  async findByUsername(username) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = TRUE LIMIT 1',
      [username]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }
}

module.exports = { User, UserRepository };