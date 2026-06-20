const express = require('express');
const { getDB } = require('../config/database');

const router = express.Router();

router.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  try {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM watering_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
