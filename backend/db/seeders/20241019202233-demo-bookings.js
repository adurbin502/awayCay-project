'use strict';

let options = { tableName: 'Bookings' };
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 1,
          startDate: '2024-10-01',
          endDate: '2024-10-05',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 2,
          userId: 2,
          startDate: '2024-11-10',
          endDate: '2024-11-15',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 3,
          userId: 3,
          startDate: '2024-12-05',
          endDate: '2024-12-10',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 4,
          userId: 4,
          startDate: '2024-12-15',
          endDate: '2024-12-20',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 5,
          userId: 5,
          startDate: '2024-12-22',
          endDate: '2024-12-28',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      options,
      {
        spotId: { [Op.in]: [1, 2, 3, 4, 5] }
      },
      {}
    );
  }
};
