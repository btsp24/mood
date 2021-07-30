const path = require('path');

const { User, Quiz, Question, Answer, QuestionType, TimeLimit, sequelize } = require('./db/models');
const { Op } = require('sequelize');
// const Sequelize = require('sequelize-values')();

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  // const userId = 'e87dd769-b724-4117-9838-0e9fe42951e7';
  // const r1 = await getQuizzesOfTheUser(userId);
  // console.log('r1 :>> ', r1);
  const aQuizId = '3e439775-8cba-43c4-b1c2-949ef219da9b';
  const r2 = await getQuestionsOfTheQuiz(aQuizId);
  console.log('r2 :>> ', r2[0]);
}

async function getQuestionsOfTheQuiz(theQuizId) {
  if (theQuizId == null) {
    throw new Error('no quizId is given');
  }
  const questionArray = [];
  try {
    // const theQuiz = await Quiz.findByPk(theQuizId);
    for (const question of await Question.findAll({
      where: { quizId: theQuizId },
      attributes: [
        'id',
        'questionOrder',
        'title',
        'imgURL',
        'createdAt',
        [sequelize.fn('COUNT', sequelize.col('Answers.id')), 'numberOfChoices'],
        [sequelize.fn('MAX', sequelize.col('TimeLimit.value')), 'timer'],
        [sequelize.fn('MAX', sequelize.col('QuestionType.title')), 'qType'],
      ],
      include: [
        {
          model: Answer,
          // attributes: [],
        },
        {
          model: QuestionType,
          attributes: [],
        },
        {
          model: TimeLimit,
          attributes: [],
        },
      ],
      group: [
        'Question.id',
        'Question.questionOrder',
        'Question.title',
        'Question.imgURL',
        'Question.createdAt',
      ],
      order: ['questionOrder'],
    })) {
      const answerArray = [];
      for (const answer of await Answer.findAll({
        where: { questionId: question.id },
        order: sequelize.random(),
      })) {
        answerArray.push(answer.toJSON());
      }
      question.answers = answerArray;
      questionArray.push(question.toJSON());
    }
  } catch (error) {
    console.log('error :>> ', error);
  }
  return questionArray;
}

async function getQuizzesOfTheUser(theUserId) {
  if (theUserId == null) {
    throw new Error('no userId is given');
  }
  const quizArray = [];
  try {
    for (const quiz of await Quiz.findAll({
      where: {
        composerId: theUserId,
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
          // attributes: ['id', 'title'],
        },
      ],
      group: ['Quiz.id', 'Quiz.title', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
      order: [['createdAt', 'DESC']],
    })) {
      quizArray.push(quiz.toJSON());
    }
  } catch (error) {
    console.log('error :>> ', error);
  }
  return quizArray;
}

async function getQuizzesOfOtherUsers(theUserId) {
  if (theUserId == null) {
    throw new Error('no userId is given');
  }
  const quizArray = [];
  // const theUser = await User.findByPk(theUserId);
  try {
    for (const quiz of await Quiz.findAll({
      where: {
        composerId: {
          [Op.ne]: theUserId,
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
      order: ['createdAt', 'DESC'],
    })) {
      quizArray.push(quiz.toJSON());
    }
  } catch (error) {
    console.log('error :>> ', error);
  }
  return quizArray;
}

main();
