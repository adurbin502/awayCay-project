const express = require('express');
const { Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve spots', error: err.message });
  }
});

router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const spots = await Spot.findAll({
      where: {
        ownerId: userId
      }
    });

    if (!spots.length) {
      return res.status(404).json({ message: 'No spots found for the current user' });
    }

    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user-owned spots', error: err.message });
  }
});

module.exports = router;
