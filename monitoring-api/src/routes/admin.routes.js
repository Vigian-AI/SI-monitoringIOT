const express = require('express');
const { getDB } = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { UserRepository } = require('../models/user.model');

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.get('/users', async (req, res) => {
  try {
    const db = getDB();
    const repo = new UserRepository(db);
    const users = await repo.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, email, password, role = 'user', is_active = true } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, dan password harus diisi' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    const db = getDB();
    const repo = new UserRepository(db);
    const existing = await repo.findByUsernameOrEmail(username, email);
    if (existing) {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar' });
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await repo.create({ username, email, passwordHash, role, is_active });
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role, is_active } = req.body;

  try {
    const db = getDB();
    const repo = new UserRepository(db);
    const user = await repo.update(id, { username, email, role, is_active });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDB();
    const repo = new UserRepository(db);
    const deleted = await repo.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/watering', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('SELECT id, device_id, action, duration_seconds, created_at FROM watering_logs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/sensors', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('SELECT id, device_id, temperature, humidity, light_intensity, soil_moisture, pump_status, created_at FROM sensor_data ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
