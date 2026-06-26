const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const { signToken, JWT_SECRET } = require('../middleware/auth');
const { UserRepository } = require('../models/user.model');

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
    const userRepo = new UserRepository(db);
    const existingUser = await userRepo.findByUsernameOrEmail(username, email);

    if (existingUser) {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.create({ username, email, passwordHash });
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
    const userRepo = new UserRepository(db);
    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

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
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role, created_at: user.created_at } });
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;