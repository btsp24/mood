const path = require('path');

const { Quiz, Question, sequelize } = require('./db/models');
const { Op } = require('sequelize');

async function main() {
  const userId = 'e87dd769-b724-4117-9838-0e9fe42951e7';
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(await getQuizList(userId));
  console.log(await getSharedQuizList(userId));
}

async function getQuizList(userId) {
  let quizList;
  try {
    quizList = await Quiz.findAll({
      where: {
        composerId: userId,
        isDraft: false,
      },
      attributes: [
        'id',
        'title',
        'imgURL',
        'createdAt',
        'composerId',
        [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'numberOfQuestions'],
      ],
      include: [
        {
          model: Question,
          attributes: [],
        },
      ],
      group: ['Quiz.id', 'Quiz.title', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
    });
  } catch (error) {
    console.log('error :>> ', error);
  }
  return quizList;
}

async function getSharedQuizList(userId) {
  let quizList;
  try {
    quizList = await Quiz.findAll({
      where: {
        composerId: {
          [Op.ne]: userId,
        },
        isDraft: false,
        isVisible: true,
      },
      attributes: [
        'id',
        'title',
        'imgURL',
        'createdAt',
        'composerId',
        [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'numberOfQuestions'],
      ],
      include: [
        {
          model: Question,
          attributes: [],
        },
      ],
      group: ['Quiz.id', 'Quiz.title', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
    });
  } catch (error) {
    console.log('error :>> ', error);
  }
  return quizList;
}

main();
