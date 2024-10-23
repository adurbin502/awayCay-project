const express = require('express');
const { Review, Spot, User, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// Validation middleware for creating a review
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

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

// POST /api/spots/:spotId/reviews - Create a review for a spot
router.post('/spots/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;
  const { review, stars } = req.body;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the user has already reviewed this spot
    const existingReview = await Review.findOne({
      where: { spotId, userId: user.id }
    });

    if (existingReview) {
      return res.status(403).json({ message: 'User already has a review for this spot' });
    }

    // Create a new review for the spot
    const newReview = await Review.create({
      userId: user.id,
      spotId,
      review,
      stars
    });

    return res.status(201).json(newReview);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
});

module.exports = router;

