const express = require('express');
const { services } = require('../server');

const router = express.Router();

router.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  try {
    const logs = await services.logs.getAllLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;