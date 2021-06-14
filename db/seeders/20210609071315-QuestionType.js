'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert(
            'QuestionTypes',
            [
                { id: 1, title: 'Multiple choice' },
                { id: 2, title: 'True-False' },
            ],
            {}
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('QuestionTypes', null, {});
    },
};
