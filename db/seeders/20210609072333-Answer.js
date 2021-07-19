'use strict';
// const { v4: uuidv4 } = require('uuid');
const { Question } = require('../models/');
const faker = require('faker');
const { v4: uuidv4 } = require('uuid');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const answerData = [];

    const questionIds = await Question.findAll({ attributes: ['id', 'questionTypeId'] });

    for (const qId of questionIds) {
      // generate random number questions
      const answerCount = qId.questionTypeId == 1 ? 2 : 4;
      const correctOne = Math.floor(Math.random() * answerCount);
      for (let aId = 0; aId < answerCount; aId++) {
        let date = new Date();
        let id = uuidv4();
        let answer = {
          questionId: qId.id,
          id,
          text: answerCount == 2 ? (aId == 0 ? 'True' : 'False') : faker.lorem.words().slice(0, 74),
          answerOrder: aId + 1,
          isCorrect: aId == correctOne ? true : false,
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
