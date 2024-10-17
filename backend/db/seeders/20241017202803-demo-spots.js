"use strict";

let options = { tableName: "Spots" };
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // Use schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: 1,
          address: "1600 Pennsylvania Ave NW",
          city: "Washington",
          state: "DC",
          country: "United States of America",
          lat: 38.897957,
          lng: -77.03656,
          name: "The White House",
          description:
            "The official residence and workplace of the President of the United States.",
          price: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 2,
          address: "Eiffel Tower",
          city: "Paris",
          state: "Ile-de-France",
          country: "France",
          lat: 48.858844,
          lng: 2.294351,
          name: "Eiffel Tower",
          description:
            "A wrought-iron lattice tower on the Champ de Mars in Paris.",
          price: 750,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 3,
          address: "Colosseum",
          city: "Rome",
          state: "Lazio",
          country: "Italy",
          lat: 41.89021,
          lng: 12.492231,
          name: "The Colosseum",
          description:
            "An ancient amphitheater in the center of Rome.",
          price: 600,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 4,
          address: "Great Wall of China",
          city: "Beijing",
          state: "Beijing",
          country: "China",
          lat: 40.431908,
          lng: 116.570374,
          name: "Great Wall of China",
          description:
            "An ancient series of walls and fortifications.",
          price: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 5,
          address: "Statue of Liberty",
          city: "New York",
          state: "New York",
          country: "United States of America",
          lat: 40.689247,
          lng: -74.044502,
          name: "Statue of Liberty",
          description:
            "A colossal neoclassical sculpture on Liberty Island in New York Harbor.",
          price: 450,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 6,
          address: "Taj Mahal",
          city: "Agra",
          state: "Uttar Pradesh",
          country: "India",
          lat: 27.175015,
          lng: 78.042155,
          name: "Taj Mahal",
          description:
            "An ivory-white marble mausoleum on the south bank of the Yamuna river.",
          price: 800,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 7,
          address: "Big Ben",
          city: "London",
          state: "England",
          country: "United Kingdom",
          lat: 51.500729,
          lng: -0.124625,
          name: "Big Ben",
          description:
            "The Great Bell of the clock at the north end of the Palace of Westminster.",
          price: 550,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 8,
          address: "Christ the Redeemer",
          city: "Rio de Janeiro",
          state: "Rio de Janeiro",
          country: "Brazil",
          lat: -22.951916,
          lng: -43.210487,
          name: "Christ the Redeemer",
          description:
            "An iconic statue of Jesus Christ in Rio de Janeiro.",
          price: 700,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 9,
          address: "Sydney Opera House",
          city: "Sydney",
          state: "New South Wales",
          country: "Australia",
          lat: -33.856784,
          lng: 151.215297,
          name: "Sydney Opera House",
          description:
            "A multi-venue performing arts centre in Sydney.",
          price: 900,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: 10,
          address: "Machu Picchu",
          city: "Cusco Region",
          state: "Urubamba Province",
          country: "Peru",
          lat: -13.163141,
          lng: -72.544963,
          name: "Machu Picchu",
          description:
            "A 15th-century Inca citadel located in the Eastern Cordillera of southern Peru.",
          price: 950,
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
        name: {
          [Op.in]: [
            "The White House",
            "Eiffel Tower",
            "The Colosseum",
            "Great Wall of China",
            "Statue of Liberty",
            "Taj Mahal",
            "Big Ben",
            "Christ the Redeemer",
            "Sydney Opera House",
            "Machu Picchu",
          ],
        },
      },
      {}
    );
  },
};
