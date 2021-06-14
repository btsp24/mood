'use strict';
const { v4: uuidv4 } = require('uuid');
const { Question } = require('../models/');
const faker = require('faker');
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const answerData = [];

        const questionIds = await Question.findAll({ attributes: ['id', 'questionTypeId'] });
        for (let index = 0; index < questionIds.length; index++) {
            // generate random number questions
            let answerCount = questionIds[index].questionTypeId == 1 ? 4 : 2;
            let correctOne = Math.floor(Math.random() * answerCount);
            for (let aId = 0; aId < answerCount; aId++) {
                let date = new Date();
                let answerId = uuidv4();

                let answer = {
                    questionId: questionIds[index].id,
                    id: answerId,
                    title: faker.lorem.words().slice(0, 74),
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
