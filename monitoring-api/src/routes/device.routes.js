const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const status = await getServices().device.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
