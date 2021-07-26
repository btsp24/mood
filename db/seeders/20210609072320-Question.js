'use strict';
const { v4: uuidv4 } = require('uuid');
const { Quiz } = require('../models/');
const faker = require('faker');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const questionsData = [];

    const quizIds = await Quiz.findAll({ attributes: ['id'] });
    for (const qzi of quizIds) {
      // generate random number questions
      let questionCount = Math.floor(3 + Math.random() * 8);
      for (let qId = 0; qId < questionCount; qId++) {
        let date = new Date();
        let questionId = uuidv4();
        let questionTypeId = Math.floor(1 + Math.random() * 2);
        let questionData = {
          quizId: qzi.id,
          id: questionId,
          text: faker.lorem.text().slice(0, 119) + '?',
          questionOrder: qId + 1,
          questionTypeId,
          timeLimitId: Math.floor(1 + Math.random() * 7),
          imgURL: `https://picsum.photos/180/120?random=${qId}`,
          imgAltText: 'picsum.photos/',
          imgCredit: 'downloaded from https://picsum.photos',
          createdAt: date,
          updatedAt: date,
        };
        questionsData.push(questionData);
      }
    }
    await queryInterface.bulkInsert('Questions', questionsData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Questions', null, {});
  },
};
