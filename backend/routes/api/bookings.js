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

module.exports = router;
