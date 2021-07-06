'use strict';
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');
// const bcrypt = require('bcrypt');
// plain password is "Password"
const PASSWORD_HASH = '$2b$05$6UxTrmDoyCCld.QiCv/sdu3nj2RPcMQrxlDLueEYEgdxCIQaSssca';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let usersData = [];

    for (let index = 0; index < 7; index++) {
      faker.locale = 'tr';
      faker.locale = 'en';
      let date = new Date();
      let userData = {
        id: uuidv4(),
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        password: PASSWORD_HASH,
        createdAt: date,
        updatedAt: date,
      };
      usersData.push(userData);
    }

    await queryInterface.bulkInsert('Users', usersData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
