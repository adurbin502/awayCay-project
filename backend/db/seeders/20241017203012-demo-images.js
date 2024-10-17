"use strict";

let options = { tableName: "Images" };
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // Use schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          url: "https://example.com/image1.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 2,
          url: "https://example.com/image2.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 3,
          url: "https://example.com/image3.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 4,
          url: "https://example.com/image4.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 5,
          url: "https://example.com/image5.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 6,
          url: "https://example.com/image6.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 7,
          url: "https://example.com/image7.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 8,
          url: "https://example.com/image8.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 9,
          url: "https://example.com/image9.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 10,
          url: "https://example.com/image10.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        url: {
          [Op.in]: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
            "https://example.com/image3.jpg",
            "https://example.com/image4.jpg",
            "https://example.com/image5.jpg",
            "https://example.com/image6.jpg",
            "https://example.com/image7.jpg",
            "https://example.com/image8.jpg",
            "https://example.com/image9.jpg",
            "https://example.com/image10.jpg",
          ],
        },
      },
      {}
    );
  },
};
