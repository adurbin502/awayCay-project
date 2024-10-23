const express = require('express');
const { Review, Spot, User, ReviewImage } = require('../../db/models');
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

// GET /api/spots/:spotId/reviews - Get all reviews for a specific spot
router.get('/spots/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  try {
    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ]
    });

    if (!reviews.length) {
      return res.status(404).json({ message: 'No reviews found for the specified spot' });
    }

    res.json({ Reviews: reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve reviews', error: err.message });
  }
});

module.exports = router;

