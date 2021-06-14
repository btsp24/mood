'use strict';
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/');
const faker = require('faker');
// const bcrypt = require('bcrypt');
// plain password is "Password"
const PASSWORD_HASH = '$2b$05$6UxTrmDoyCCld.QiCv/sdu3nj2RPcMQrxlDLueEYEgdxCIQaSssca';
// faker.locale = 'tr';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const quizData = [];

        const userIds = await User.findAll({ attributes: ['id'] });
        for (let u = 0; u < userIds.length; u++) {
            let quizCount = Math.floor(1 + Math.random() * 5);
            for (let index = 0; index < quizCount; index++) {
                let date = new Date();
                let quizId = uuidv4();
                let quiz = {
                    id: quizId,
                    title: faker.lorem.words().slice(0, 95).toUpperCase(),
                    description: faker.commerce.productDescription(),
                    composerId: userIds[u].id,
                    isVisible: !!Math.floor(Math.random() * 2),
                    imgURL: 'http://placeimg.com/480/320',
                    imgAltText: 'downloaded from placeimg.com',
                    imgCredit: 'placeimg.com',
                    lobbyMusicId: Math.floor(1 + Math.random() * 14),
                    isDraft: false,
                    createdAt: date,
                    updatedAt: date,
                };
                quizData.push(quiz);
            }
        }

        await queryInterface.bulkInsert('Quizzes', quizData, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Quizzes', null, {});
    },
};
