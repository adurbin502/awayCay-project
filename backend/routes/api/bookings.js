const express = require('express');
const { Booking, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require('sequelize');
const router = express.Router();

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

  const bookingsWithExtras = bookings.map((booking) => {
    const bookingData = booking.toJSON();
    bookingData.Spot.previewImage = bookingData.Spot.SpotImages?.[0]?.url || null;
    delete bookingData.Spot.SpotImages;
    return bookingData;
  });

  res.json({ Bookings: bookingsWithExtras });
});

// POST - Create a booking for a spot
router.post('/spots/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const spot = await Spot.findByPk(spotId);
  if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

  if (spot.ownerId === req.user.id) {
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
    return res.status(403).json({
      message: 'Sorry, this spot is already booked for the specified dates',
      errors: {
        startDate: 'Start date conflicts with an existing booking',
        endDate: 'End date conflicts with an existing booking',
      },
    });
  }

  const newBooking = await Booking.create({
    spotId,
    userId: req.user.id,
    startDate,
    endDate,
  });

  res.status(201).json(newBooking);
});

// PUT - Edit a booking
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking couldn't be found" });

  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You do not own this booking.' });
  }

  const conflictingBooking = await Booking.findOne({
    where: {
      spotId: booking.spotId,
      id: { [Op.ne]: bookingId },
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
        { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } },
      ],
    },
  });

  if (conflictingBooking) {
    return res.status(403).json({
      message: 'Sorry, this spot is already booked for the specified dates',
      errors: {
        startDate: 'Start date conflicts with an existing booking',
        endDate: 'End date conflicts with an existing booking',
      },
    });
  }

  booking.startDate = start
  booking.endDate = endDate;
  await booking.save();

  res.status(200).json(booking);
});

// DELETE - Delete a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking couldn't be found" });

  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You do not own this booking.' });
  }

  await booking.destroy();
  res.status(200).json({ message: 'Successfully deleted' });
});

module.exports = router;
