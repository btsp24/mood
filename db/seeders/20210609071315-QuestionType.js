'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'QuestionTypes',
      [
        { id: 1, title: 'True-False' },
        { id: 2, title: 'Multiple choice' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('QuestionTypes', null, {});
  },
};
