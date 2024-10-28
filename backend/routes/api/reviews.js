const express = require('express');
const { Review, Spot, User, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// Validation middleware for creating/editing a review
const validateReview = [
  check('review').exists({ checkFalsy: true }).withMessage('Review text is required'),
  check('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

// Validation middleware for adding a review image
const validateImage = [
  check('url').exists({ checkFalsy: true }).isURL().withMessage('Please provide a valid URL for the image.'),
  handleValidationErrors,
];

// GET - Get all reviews of the current user
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const reviews = await Review.findAll({
    where: { userId },
    include: [
      {
        model: Spot,
        attributes: ['id', 'name', 'city', 'state', 'country', 'price'],
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url'],
      },
    ],
  });

  res.json({ Reviews: reviews });
});

// POST - Create a review for a spot
router.post('/spots/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;

  const spot = await Spot.findByPk(spotId);
  if (!spot) return res.status(404).json({ title: "Resource Not Found", message: "Spot couldn't be found" });

  const existingReview = await Review.findOne({ where: { spotId, userId: req.user.id } });
  if (existingReview) {
    return res.status(403).json({ message: 'User already has a review for this spot' });
  }

  const newReview = await Review.create({
    userId: req.user.id,
    spotId,
    review,
    stars,
  });

  return res.status(201).json(newReview);
});

// POST - Add an image to a review
router.post('/:reviewId/images', requireAuth, validateImage, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;

  const review = await Review.findByPk(reviewId);
  if (!review) return res.status(404).json({ title: "Resource Not Found", message: "Review couldn't be found" });

  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
  }

  const imageCount = await ReviewImage.count({ where: { reviewId } });
  if (imageCount >= 10) {
    return res.status(403).json({ message: 'Maximum number of images for this resource was reached' });
  }

  const newImage = await ReviewImage.create({ reviewId, url });
  res.status(201).json(newImage);
});

// PUT - Edit a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;

  const existingReview = await Review.findByPk(reviewId);
  if (!existingReview) return res.status(404).json({ title: "Resource Not Found", message: "Review couldn't be found" });

  if (existingReview.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
  }

  existingReview.review = review;
  existingReview.stars = stars;
  await existingReview.save();

  return res.status(200).json(existingReview);
});

// DELETE - Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByPk(reviewId);
  if (!review) return res.status(404).json({ title: "Resource Not Found", message: "Review couldn't be found" });

  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
  }

  await review.destroy();
  res.status(200).json({ message: 'Successfully deleted' });
});

module.exports = router;
