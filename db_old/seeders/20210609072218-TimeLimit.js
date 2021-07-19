'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'TimeLimits',
      [
        { id: 1, value: 5 },
        { id: 2, value: 10 },
        { id: 3, value: 20 },
        { id: 4, value: 30 },
        { id: 5, value: 60 },
        { id: 6, value: 90 },
        { id: 7, value: 120 },
        { id: 8, value: 240 },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TimeLimits', null, {});
  },
};
