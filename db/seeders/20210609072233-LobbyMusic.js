'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'LobbyMusics',
      [
        {
          id: 1,
          name: 'Spook4',
          audioURL: '/audio/peritune-spook4.mp3',
          audioCredit: `Spook4 by PeriTune | http://peritune.com
          Attribution 4.0 International (CC BY 4.0)
          https://creativecommons.org/licenses/by/4.0/
          Music promoted by https://www.chosic.com/`,
        },
        {
          id: 2,
          name: 'Monkeys Spinning Monkeys',
          audioURL: '/audio/Monkeys-Spinning-Monkeys.mp3',
          audioCredit: `Monkeys Spinning Monkeys Kevin MacLeod (incompetech.com)
          Licensed under Creative Commons: By Attribution 3.0 License
          http://creativecommons.org/licenses/by/3.0/
          Music promoted by https://www.chosic.com/`,
        },
        {
          id: 3,
          name: 'Rise And Shine',
          audioURL: '/audio/rise-and-shine.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 4,
          name: 'Brazilian Street Fight',
          audioURL: '/audio/punch-deck-brazilian-street-fight.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 5,
          name: 'Travel to the Horizon',
          audioURL: '/audio/pKomiku_-_43_-_Travel_to_the_Horizon.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 6,
          name: 'Suburb',
          audioURL: '/audio/Komiku_-_04_-_Suburb.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 7,
          name: 'Chillin’ Poupi',
          audioURL: '/audio/Komiku_-_50_-_Chillin_Poupi.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 8,
          name: 'Shopping List',
          audioURL: '/audio/Komiku_-_04_-_Shopping_List.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 9,
          name: 'Garage',
          audioURL: '/audio/Monplaisir_-_02_-_Garage.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 10,
          name: 'School',
          audioURL: '/audio/Komiku_-_06_-_School.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 11,
          name: 'Ponky Fonky Ferret',
          audioURL: '/audio/Goto80_and_the_Uwe_Schenk_Band_-_01_-_Ponky_Fonky_Ferret.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 12,
          name: 'Skipping in the No Standing Zone',
          audioURL: '/audio/Peter_Gresser_-_04_-_Skipping_in_the_No_Standing_Zone.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
        {
          id: 13,
          name: 'Skate',
          audioURL: '/audio/Komiku_-_04_-_Skate.mp3',
          audioCredit: `https://www.chosic.com/`,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('LobbyMusics', null, {});
  },
};
