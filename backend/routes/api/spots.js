const express = require('express');
const { Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// Validation middleware for creating a spot
const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  handleValidationErrors,
];

// Validation middleware for adding a spot image
const validateImage = [
  check('url')
    .exists({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid URL for the image.'),
  check('preview')
    .exists({ checkFalsy: true })
    .isBoolean()
    .withMessage('Please provide a boolean value for the preview field.'),
  handleValidationErrors,
];

// Validation middleware for editing a spot
const validateSpotUpdate = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  handleValidationErrors,
];

// POST - Create a new spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req;

  try {
    const spot = await Spot.create({
      ownerId: user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    return res.status(201).json(spot);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create spot', error: err.message });
  }
});

// POST - Add an image to a spot
router.post('/:spotId/images', requireAuth, validateImage, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const { user } = req;

  try {
    // Find the spot by ID and check if the current user is the owner
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

    // Create the new image for the spot
    const newImage = await SpotImage.create({
      spotId: spot.id,
      url,
      preview
    });

    return res.status(201).json(newImage);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add image', error: err.message });
  }
});

// PUT - Edit a spot
router.put('/:spotId', requireAuth, validateSpotUpdate, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req;

  try {
    // Find the spot by ID
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Ensure the current user is the owner of the spot
    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

    // Update the spot with new values
    spot.address = address;
    spot.city = city;
    spot.state = state;
    spot.country = country;
    spot.lat = lat;
    spot.lng = lng;
    spot.name = name;
    spot.description = description;
    spot.price = price;

    await spot.save();

    return res.status(200).json(spot);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to edit spot', error: err.message });
  }
});

// DELETE - Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  try {
    // Find the spot by ID
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Ensure the current user is the owner of the spot
    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

    // Delete the spot
    await spot.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete spot', error: err.message });
  }
});

// GET all spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve spots', error: err.message });
  }
});

// GET all spots owned by the current user
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

// GET spot by id
router.get('/:spotId', async (req, res) => {
  try {
    const spotId = req.params.spotId;

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve spot details', error: err.message });
  }
});

module.exports = router;

