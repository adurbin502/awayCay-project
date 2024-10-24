const express = require('express');
const { Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
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

// Validation middleware for query parameters
const validateQueryParams = [
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be greater than or equal to 1'),
  check('size')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20'),
  check('minLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Minimum latitude is invalid'),
  check('maxLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Maximum latitude is invalid'),
  check('minLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Minimum longitude is invalid'),
  check('maxLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Maximum longitude is invalid'),
  check('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be greater than or equal to 0'),
  check('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be greater than or equal to 0'),
  handleValidationErrors
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
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

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
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

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
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

    await spot.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete spot', error: err.message });
  }
});

// DELETE - Delete a spot image
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const { user } = req;

  try {
    const image = await SpotImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    const spot = await Spot.findByPk(image.spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot.' });
    }

    await image.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete spot image', error: err.message });
  }
});

// GET all spots with query filters
router.get('/', validateQueryParams, async (req, res) => {
  const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

  const query = {
    where: {},
    limit: parseInt(size),
    offset: (parseInt(page) - 1) * parseInt(size),
  };

  if (minLat) query.where.lat = { [Op.gte]: parseFloat(minLat) };
  if (maxLat) query.where.lat = { ...query.where.lat, [Op.lte]: parseFloat(maxLat) };

  if (minLng) query.where.lng = { [Op.gte]: parseFloat(minLng) };
  if (maxLng) query.where.lng = { ...query.where.lng, [Op.lte]: parseFloat(maxLng) };

  if (minPrice) query.where.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) query.where.price = { ...query.where.price, [Op.lte]: parseFloat(maxPrice) };

  try {
    const spots = await Spot.findAll(query);

    const spotsWithExtras = await Promise.all(spots.map(async spot => {
      const spotData = spot.toJSON();

      const previewImage = await SpotImage.findOne({
        where: {
          spotId: spot.id,
          preview: true,
        },
        attributes: ['url'],
      });
      spotData.previewImage = previewImage ? previewImage.url : null;

      spotData.avgRating = 4.5;

      return spotData;
    }));

    return res.json({
      Spots: spotsWithExtras,
      page: parseInt(page),
      size: parseInt(size),
    });
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
