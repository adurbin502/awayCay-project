"use strict";

let options = { tableName: "Reviews" };
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // Use schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          userId: 1,
          spotId: 1,
          review: "Example review 1",
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 2,
          spotId: 2,
          review: "Example review 2",
          stars: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 3,
          spotId: 3,
          review: "Example review 3",
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 4,
          spotId: 4,
          review: "Example review 4",
          stars: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 5,
          spotId: 5,
          review: "Example review 5",
          stars: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 6,
          spotId: 6,
          review: "Example review 6",
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 7,
          spotId: 7,
          review: "Example review 7",
          stars: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 8,
          spotId: 8,
          review: "Example review 8",
          stars: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 9,
          spotId: 9,
          review: "Example review 9",
          stars: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 10,
          spotId: 10,
          review: "Example review 10",
          stars: 5,
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
        review: {
          [Op.in]: [
            "Example review 1",
            "Example review 2",
            "Example review 3",
            "Example review 4",
            "Example review 5",
            "Example review 6",
            "Example review 7",
            "Example review 8",
            "Example review 9",
            "Example review 10",
          ],
        },
      },
      {}
    );
  },
};
