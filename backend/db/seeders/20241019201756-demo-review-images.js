"use strict";

let options = { tableName: "ReviewImages" };
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          reviewId: 1,
          url: "https://example.com/review1-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 2,
          url: "https://example.com/review2-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 3,
          url: "https://example.com/review3-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 4,
          url: "https://example.com/review4-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 5,
          url: "https://example.com/review5-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 6,
          url: "https://example.com/review6-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 7,
          url: "https://example.com/review7-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 8,
          url: "https://example.com/review8-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 9,
          url: "https://example.com/review9-image1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: 10,
          url: "https://example.com/review10-image1.jpg",
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
            "https://example.com/review1-image1.jpg",
            "https://example.com/review2-image1.jpg",
            "https://example.com/review3-image1.jpg",
            "https://example.com/review4-image1.jpg",
            "https://example.com/review5-image1.jpg",
            "https://example.com/review6-image1.jpg",
            "https://example.com/review7-image1.jpg",
            "https://example.com/review8-image1.jpg",
            "https://example.com/review9-image1.jpg",
            "https://example.com/review10-image1.jpg",
          ],
        },
      },
      {}
    );
  }
};
