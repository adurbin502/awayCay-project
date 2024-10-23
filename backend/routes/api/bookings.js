const express = require('express');
const { Booking, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// Validation middleware for booking creation
const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('Please provide a valid start date.'),
  check('endDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('Please provide a valid end date.'),
  handleValidationErrors,
];

// GET /api/bookings/current - Get all of the current user's bookings
router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
          include: [
            {
              model: SpotImage,
              where: { preview: true },
              required: false,
              attributes: ['url'],
            },
          ],
        },
      ],
    });

    const bookingsWithExtras = bookings.map(booking => {
      const bookingData = booking.toJSON();
      const previewImage = booking.Spot.SpotImages[0]?.url || null;
      bookingData.Spot.previewImage = previewImage;
      delete bookingData.Spot.SpotImages; // Remove the SpotImages array
      return bookingData;
    });

    res.json({ Bookings: bookingsWithExtras });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve bookings', error: err.message });
  }
});

// GET /api/spots/:spotId/bookings - Get all bookings for a spot by spot's ID
router.get('/spots/:spotId/bookings', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    const isOwner = spot.ownerId === user.id;

    // Get bookings for the spot
    const bookings = await Booking.findAll({
      where: { spotId },
      attributes: isOwner
        ? undefined // Owner sees all booking details
        : ['spotId', 'startDate', 'endDate'], // Non-owners see limited booking details
    });

    return res.json({ Bookings: bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve bookings', error: err.message });
  }
});

// POST /api/spots/:spotId/bookings - Create a booking for a spot
router.post('/spots/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;
  const { user } = req;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Ensure the user is not booking their own spot
    if (spot.ownerId === user.id) {
      return res.status(403).json({ message: 'You cannot book your own spot.' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        spotId,
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] },
          },
          {
            endDate: { [Op.between]: [startDate, endDate] },
          },
          {
            startDate: { [Op.lte]: startDate },
            endDate: { [Op.gte]: endDate },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(403).json({ message: 'Spot is already booked for the specified dates.' });
    }

    // Create the new booking
    const newBooking = await Booking.create({
      spotId,
      userId: user.id,
      startDate,
      endDate,
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

module.exports = router;
