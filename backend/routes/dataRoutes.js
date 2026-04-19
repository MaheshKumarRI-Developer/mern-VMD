const express = require('express');
const Data = require('../models/Data');

const router = express.Router();

// GET all data
router.get('/', async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single data
router.get('/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new data
router.post('/', async (req, res) => {
const data = new Data({
  server: req.body.server,
  type: req.body.type,
  code: req.body.code,
  issue: req.body.issue,
  severity: req.body.severity,
  timestamp: req.body.timestamp
});
  try {
    const newData = await data.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update data
router.put('/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data not found' });
    data.title = req.body.title || data.title;
    data.content = req.body.content || data.content;
    const updatedData = await data.save();
    res.json(updatedData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE data
router.delete('/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data not found' });
    await data.remove();
    res.json({ message: 'Data deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;