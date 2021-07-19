'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'QuestionTypes',
      [
        { id: 1, value: 'True-False' },
        { id: 2, value: 'Multiple choice' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('QuestionTypes', null, {});
  },
};
