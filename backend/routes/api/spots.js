const express = require('express');
const { Spot } = require('../../db/models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve spots', error: err.message });
  }
});

module.exports = router;
