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
    for (const usi of userIds) {
      let quizCount = Math.floor(1 + Math.random() * 6);
      for (let index = 0; index < quizCount; index++) {
        let date = new Date();
        let quizId = uuidv4();
        let quiz = {
          id: quizId,
          text: faker.lorem.words().slice(0, 95),
          description: faker.commerce.productDescription(),
          composerId: usi.id,
          isVisible: !Math.floor(Math.random() * 2),
          imgURL: `https://picsum.photos/180/120?random=${index}`,
          imgAltText: 'picsum.photos/',
          imgCredit: 'downloaded from https://picsum.photos',
          lobbyMusicId: Math.floor(1 + Math.random() * 14),
          isDraft: !Math.floor(Math.random() * 2),
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
