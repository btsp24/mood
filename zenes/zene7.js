const {
  User,
  Quiz,
  Question,
  Answer,
  QuestionType,
  TimeLimit,
  Game,
  Player,
  PlayerAnswer,
  sequelize,
  /* Sequelize, */
} = require('./db/models');
const { Op, QueryTypes } = require('sequelize');
const { Query } = require('./utils/queries');

const aUserId = 'd1eaaa7a-31f6-4415-ad60-29f6dcd1eead';
const aQuizId = 'dccc38ab-9ab4-4d97-b22d-27fd057562ef';
const aQuestionId = 'a4cd6e66-0aa5-4f95-8b8a-efb2a593f99f';
const anAnswerId = '80163a59-e906-49d6-bc95-dd5e97375f25';
const userToDelete = '9b174d15-ba75-431c-9194-3ad3e4745fbc';
const quizToClone = 'c7d3e463-4e4d-4db2-aa0f-c6e9c0203e55';
const theGameId = 'ea90b326-e86b-11eb-ae26-00155dde6ceb';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('connected 👍');

    const game = await Game.findByPk(theGameId);
    const players = await game.getPlayers({ raw: true });
    for (const player of players) {
      const pa = await PlayerAnswer.findOne({ where: { playerId: player.id }, raw: true });
      console.log('pa :>> ', pa);
      // console.log(
      //   `${player.nickName} countAnswers() :>>`,
      //   await player.countAnswers({ where: { isCorrect: true } })
      // );
    }
    // console.log('game player count :>> ', await game.getPlayers());
    // console.log('qqwa :>> ', qqwa);
    /*     const theUser = await User.findByPk(aUserId);
    await theUser.createGame(
      'bbacdeab-9ab4-4d97-b22d-27fd057562ef',
      'dccc38ab-9ab4-4d97-b22d-27fd057562ef',
      aUserId,
      Date.now(),
      Date.now()
    );
    console.log('theUser.getGames() :>> ', await theUser.getGames()); */
    /*     const sql = `SELECT * FROM Users WHERE id = ?`;
    const [results, metadata] = await sequelize.query('SELECT * FROM users WHERE id = :id', {
      replacements: { id: aUserId },
      type: QueryTypes.SELECT,
    }); 
    console.log('results :>> ', results);

    */
  } catch (error) {
    console.log('error 💩:>>', error);
  }
}

main();
