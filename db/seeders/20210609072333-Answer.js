'use strict';
// const { v4: uuidv4 } = require('uuid');
const { Question } = require('../models/');
const faker = require('faker');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const answerData = [];

    const questionIds = await Question.findAll({ attributes: ['id', 'questionTypeId'] });
    for (const qui of questionIds) {
      // generate random number questions
      const answerCount = qui.questionTypeId == 1 ? 2 : 4;
      const correctOne = Math.floor(1 + Math.random() * answerCount);
      for (let id = 1; id <= answerCount; id++) {
        const date = new Date();
        // let answerId = uuidv4();

        const answer = {
          questionId: qui.id,
          id,
          text: faker.lorem.words().slice(0, 74),
          isCorrect: id === correctOne,
          createdAt: date,
          updatedAt: date,
        };
        answerData.push(answer);
        // generate answers
      }
    }
    await queryInterface.bulkInsert('Answers', answerData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Answers', null, {});
  },
};
