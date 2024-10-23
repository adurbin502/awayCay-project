const express = require('express');
const { Review, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// GET /api/reviews/current - Get all reviews of the current user
router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: Spot,
          attributes: ['id', 'name', 'city', 'state', 'country', 'price']
        }
      ]
    });

    if (!reviews.length) {
      return res.status(404).json({ message: 'No reviews found for the current user' });
    }

    res.json({ Reviews: reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user reviews', error: err.message });
  }
});

module.exports = router;
