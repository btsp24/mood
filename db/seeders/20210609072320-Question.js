'use strict';
const { v4: uuidv4 } = require('uuid');
const { Quiz } = require('../models/');
const faker = require('faker');
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const questionsData = [];
        //const quizQuestionsPair = [];

        const quizIds = await Quiz.findAll({ attributes: ['id'] });
        for (let index = 0; index < quizIds.length; index++) {
            // generate random number questions
            let questionCount = Math.floor(2 + Math.random() * 9);
            for (let qId = 0; qId < questionCount; qId++) {
                let date = new Date();
                let questionId = uuidv4();
                /*       quizQuestionsPair.push({
                    questionId,
                    quizId: quizIds[index].id,
                    createdAt: date,
                    updatedAt: date,
                });
           */
                let questionTypeId = Math.floor(1 + Math.random() * 2);
                let questionData = {
                    quizId: quizIds[index].id,
                    id: questionId,
                    questionTypeId,
                    title: faker.lorem.text().slice(0, 119) + '?',
                    imgURL: 'http://placeimg.com/480/320',
                    imgAltText: 'downloaded from placeimg.com',
                    imgCredit: 'placeimg.com',
                    timeLimitId: Math.floor(2 + Math.random() * 7),
                    questionOrder: qId + 1,
                    createdAt: date,
                    updatedAt: date,
                };
                questionsData.push(questionData);
            }
        }
        await queryInterface.bulkInsert('Questions', questionsData, {});
        // await queryInterface.bulkInsert('QuizQuestions', quizQuestionsPair, {});
    },

    down: async (queryInterface, Sequelize) => {
        // await queryInterface.bulkDelete('QuizQuestions', null, {});
        await queryInterface.bulkDelete('Questions', null, {});
    },
};
