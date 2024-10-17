'use strict';

const bcrypt = require('bcryptjs');

let options = { tableName: 'Users' };
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@user.io',
          username: 'Demo-lition',
          hashedPassword: bcrypt.hashSync('password'),
        },
        {
          firstName: 'User',
          lastName: 'One',
          email: 'user1@user.io',
          username: 'FakeUser1',
          hashedPassword: bcrypt.hashSync('password2'),
        },
        {
          firstName: 'User',
          lastName: 'Two',
          email: 'user2@user.io',
          username: 'FakeUser2',
          hashedPassword: bcrypt.hashSync('password3'),
        },
        {
          firstName: 'User',
          lastName: 'Three',
          email: 'user3@user.io',
          username: 'FakeUser3',
          hashedPassword: bcrypt.hashSync('password4'),
        },
        {
          firstName: 'User',
          lastName: 'Four',
          email: 'user4@user.io',
          username: 'FakeUser4',
          hashedPassword: bcrypt.hashSync('password5'),
        },
        {
          firstName: 'User',
          lastName: 'Five',
          email: 'user5@user.io',
          username: 'FakeUser5',
          hashedPassword: bcrypt.hashSync('password6'),
        },
        {
          firstName: 'User',
          lastName: 'Six',
          email: 'user6@user.io',
          username: 'FakeUser6',
          hashedPassword: bcrypt.hashSync('password7'),
        },
        {
          firstName: 'User',
          lastName: 'Seven',
          email: 'user7@user.io',
          username: 'FakeUser7',
          hashedPassword: bcrypt.hashSync('password8'),
        },
        {
          firstName: 'User',
          lastName: 'Eight',
          email: 'user8@user.io',
          username: 'FakeUser8',
          hashedPassword: bcrypt.hashSync('password9'),
        },
        {
          firstName: 'User',
          lastName: 'Nine',
          email: 'user9@user.io',
          username: 'FakeUser9',
          hashedPassword: bcrypt.hashSync('password10'),
        }
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: {
          [Op.in]: [
            'Demo-lition',
            'FakeUser1',
            'FakeUser2',
            'FakeUser3',
            'FakeUser4',
            'FakeUser5',
            'FakeUser6',
            'FakeUser7',
            'FakeUser8',
            'FakeUser9'
          ]
        },
      },
      {}
    );
  }
};
