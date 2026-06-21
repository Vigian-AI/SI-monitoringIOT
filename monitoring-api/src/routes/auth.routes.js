const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const { signToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, dan password harus diisi' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    const db = getDB();
    const existingResult = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  try {
    const db = getDB();
    const rowsResult = await db.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = TRUE LIMIT 1',
      [username]
    );

    if (rowsResult.rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = rowsResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login berhasil',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const rowsResult = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
      [decoded.id]
    );

    if (rowsResult.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ user: rowsResult.rows[0] });
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;
