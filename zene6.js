const { User, Quiz, Question, Answer, Player, PlayerAnswer, sequelize, Sequelize } = require('./db/models');
const { Op } = require('sequelize');
const { Query } = require('./utils/queries');

const userId = '09324686-cd3b-4bd4-90a4-8aed302559b8';
const aQuizId = '8412d5bd-5fa5-4409-8129-cc388de980cd';
const aQuestionId = '43664bf2-9f42-4bc4-a9cf-e73241aa4a3e';
const anAnswerId = '2';
const userToDelete = '6d2ec777-55e1-4ed6-865c-ab82eb5bd0c9';
const theGameId = '0508bf24-9d84-412b-8cf6-759da1d4f197';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('👍connected');

    // const datasetOld = await Query.getQuizDataset(aQuizId);
    // await Query.cloneQuiz(datasetOld, userId);

    const players = await PlayerAnswer.findAndCountAll({
      where: { gameId: theGameId },
      attributes: [
        'gameId',
        'playerId',
        [sequelize.fn('COUNT', sequelize.col('Answer.id')), 'correctAnswers'],
      ],
      include: [
        {
          model: Answer,
          where: {
            isCorrect: true,
          },
          // attributes: ['isCorrect'],
          // attributes: [],
        },
      ],
    });
    for (const player of players.rows) {
      console.log('player :>> ', player.toJSON());
      // for (const plA of player.PlayerAnswers) {
      //   console.log('playerAnswers :>> ', plA);
      // }
    }
  } catch (error) {
    console.log('---------');
    console.log('⛔ error :>>', error);
  }
}

main();
