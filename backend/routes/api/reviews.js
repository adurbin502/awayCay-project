const express = require('express');
const { Review, Spot, User, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// Validation middleware for creating/editing a review
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

// Validation middleware for adding a review image
const validateImage = [
  check('url')
    .exists({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid URL for the image.'),
  handleValidationErrors,
];

// GET - Get all reviews of the current user
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

// GET - Get all reviews for a specific spot
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

// POST - Create a review for a spot
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

// POST - Add an image to a review
router.post('/:reviewId/images', requireAuth, validateImage, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;

  try {
    // Find the review by ID
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Check if the review belongs to the current user
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
    }

    // Count the number of existing images for the review
    const imageCount = await ReviewImage.count({ where: { reviewId } });

    if (imageCount >= 10) {
      return res.status(403).json({ message: 'Maximum number of images for this review reached' });
    }

    // Create the new review image
    const newImage = await ReviewImage.create({
      reviewId,
      url
    });

    return res.status(201).json(newImage);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add image', error: err.message });
  }
});

// PUT - Edit a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;

  try {
    // Find the review by ID
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Ensure the current user is the owner of the review
    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
    }

    // Update the review with new values
    existingReview.review = review;
    existingReview.stars = stars;

    await existingReview.save();

    return res.status(200).json(existingReview);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to edit review', error: err.message });
  }
});

// DELETE - Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;

  try {
    // Find the review by ID
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Ensure the current user is the owner of the review
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
    }

    // Delete the review
    await review.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
});

// DELETE - Delete a review image
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  try {
    const image = await ReviewImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: "Review Image couldn't be found" });
    }

    const review = await Review.findByPk(image.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Ensure the current user is the owner of the review
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this review.' });
    }

    await image.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete review image', error: err.message });
  }
});

module.exports = router;
