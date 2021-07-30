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
  PlayerQuestion,
  sequelize,
  /* Sequelize, */
} = require('../db/models');
const { v4: uuidv4 } = require('uuid');
const { Op, QueryTypes } = require('sequelize');
const { Query } = require('../utils/queries');

const aUserId = '7af08c41-5910-4b27-9dbd-461aae936c3b';
const aQuizId = '35f4f4cc-5b88-4e0b-84dc-efc8b3b944b1';
const aQuestionId = '46b912e4-e367-4dde-b332-721587719605';
const anAnswerId = '80163a59-e906-49d6-bc95-dd5e97375f25';
const userToDelete = '9b174d15-ba75-431c-9194-3ad3e4745fbc';
const quizToClone = 'c7d3e463-4e4d-4db2-aa0f-c6e9c0203e55';
const theGameId = 'ee0267cb-47b7-4115-b906-98319446b5a0';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('connected 👍');

    const user = await User.findByPk('3fc42a21-c711-4ca1-be60-00d005e20168');
    // const game = await Game.create({id: uuidv4(), quizId: aQuizId, hostedBy: aUserId });
    // await user.addGame(game);
    // console.log('game :>> ', game);
  //   await PlayerQuestion.bulkCreate([
  //     {playerId: '383bd92b-da2c-4bb2-83c4-5c02814654ca',questionId:'567a527a-f230-4253-a999-36c9f6896f0f'},
  //     {playerId: '4a15edb2-6479-4a92-857f-27164be6c545',questionId:'567a527a-f230-4253-a999-36c9f6896f0f'},
  //     {playerId: '1932ba6f-3ee4-4a04-8b19-262373f3195e',questionId:'567a527a-f230-4253-a999-36c9f6896f0f'},
  //     {playerId: '1932ba6f-3ee4-4a04-8b19-262373f3195e',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf'},
  //     {playerId: '4a15edb2-6479-4a92-857f-27164be6c545',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf'},
  //     {playerId: '383bd92b-da2c-4bb2-83c4-5c02814654ca',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf'},
  // ])
  //   await PlayerAnswer.bulkCreate([
  //     {playerId: '383bd92b-da2c-4bb2-83c4-5c02814654ca',questionId:'567a527a-f230-4253-a999-36c9f6896f0f', answerId:'8ed449c3-674b-44ae-9e1d-90fbc98736f9'},
  //     {playerId: '4a15edb2-6479-4a92-857f-27164be6c545',questionId:'567a527a-f230-4253-a999-36c9f6896f0f', answerId: '8ed449c3-674b-44ae-9e1d-90fbc98736f9'},
  //     {playerId: '1932ba6f-3ee4-4a04-8b19-262373f3195e',questionId:'567a527a-f230-4253-a999-36c9f6896f0f', answerId: 'eaeeda61-5ce1-4027-9128-5546ac2d4f7b'},
  //     {playerId: '1932ba6f-3ee4-4a04-8b19-262373f3195e',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf', },
  //     {playerId: '4a15edb2-6479-4a92-857f-27164be6c545',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf', answerId: '39d57360-e4ec-4fce-821e-c1f50e5a2020'},
  //     {playerId: '383bd92b-da2c-4bb2-83c4-5c02814654ca',questionId:'968be9cb-3475-4771-ac5a-0014b44145cf', answerId: '0947d8ef-8687-4095-b628-ffe912673355'},

  // ])
  // const ss = await Query.savePlayerQuestionScore('383bd92b-da2c-4bb2-83c4-5c02814654ca','567a527a-f230-4253-a999-36c9f6896f0f','dd25081e-967e-44d2-b7ac-bbea888093a8', 300);
    const scores = await Query.getPlayersQuestionScores(theGameId,1);
    console.log('scores :>> ', scores);
    const res = await Query.getAnswersOfQuestionByQuizIdAndQNumber(aQuizId,2);
    console.log('res.count :>> ', res.count);
    console.log('res.question :>> ', res.question);
    // console.log('res.rows :>> ', res.rows);


    // const game = await Game.findByPk(theGameId,{logging: false});
    // const players = await game.getPlayers({logging: false});
    // for (const player of players) {
    //   // const pa = await PlayerAnswer.findAll({ where: { playerId: player.id }, include:{model: Player, attributes: ['nickName']}, raw: true });
    //   // console.log('playerAnswers :>> ', pa);
    //   console.log(
    //     `${player.nickName} correct answer count :>>`,
    //     await player.countAnswers({ where: { isCorrect: true },logging: false }), "/", 
    //     await player.countQuestions({ logging: false })
    //   );
    // }
    // console.log('game player count :>> ', await game.countPlayers({logging: false}));
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
