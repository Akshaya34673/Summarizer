const express = require('express');
const History = require('../models/History');

const router = express.Router();

// No need to add /history again
router.get('/', async (req, res) => {
  try {
    const histories = await History.find().sort({ createdAt: -1 });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
