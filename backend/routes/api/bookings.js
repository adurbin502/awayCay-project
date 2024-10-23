const express = require('express');
const { Booking, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

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

module.exports = router;

