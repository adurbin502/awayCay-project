const express = require('express');
const { Booking, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require('sequelize');
const router = express.Router();

// Validation middleware for booking creation and updates
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

// GET - Get all of the current user's bookings
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

// GET - Get all bookings for a spot by spot's ID
router.get('/spots/:spotId/bookings', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const isOwner = spot.ownerId === user.id;

    const bookings = await Booking.findAll({
      where: { spotId },
      attributes: isOwner ? undefined : ['spotId', 'startDate', 'endDate'],
    });

    return res.json({ Bookings: bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve bookings', error: err.message });
  }
});

// POST - Create a booking for a spot
router.post('/spots/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;
  const { user } = req;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId === user.id) {
      return res.status(403).json({ message: 'You cannot book your own spot.' });
    }

    const conflictingBooking = await Booking.findOne({
      where: {
        spotId,
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(403).json({ message: 'Spot is already booked for the specified dates.' });
    }

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

// PUT - Edit a booking
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;
  const { user } = req;

  try {
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    if (booking.userId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this booking.' });
    }

    // Check if new dates conflict with existing bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        spotId: booking.spotId,
        id: { [Op.ne]: bookingId }, // Exclude the current booking
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(403).json({ message: 'Spot is already booked for the specified dates.' });
    }

    // Update booking with new dates
    booking.startDate = startDate;
    booking.endDate = endDate;

    await booking.save();

    return res.status(200).json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to edit booking', error: err.message });
  }
});

// DELETE - Delete a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const { user } = req;

  try {
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    if (booking.userId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this booking.' });
    }

    await booking.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete booking', error: err.message });
  }
});

module.exports = router;
