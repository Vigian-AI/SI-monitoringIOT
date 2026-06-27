const express = require('express');
const { getServices } = require('../services');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const schedules = await getServices().schedule.getAll();
    const next = getServices().schedule.getNextSchedule(schedules);
    res.json({ schedules, next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const schedule = await getServices().schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const schedule = await getServices().schedule.update(parseInt(req.params.id), req.body);
    if (!schedule) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await getServices().schedule.delete(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    res.json({ message: 'Jadwal dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
