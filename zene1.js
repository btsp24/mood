const path = require('path');

const { User, Quiz, Question, Answer, QuestionType, TimeLimit, sequelize } = require('./db/models');
const { Op } = require('sequelize');
const { Query } = require('./utils/queries');
// const Sequelize = require('sequelize-values')();

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  // const userId = 'e87dd769-b724-4117-9838-0e9fe42951e7';
  // const aQuizId = '3e439775-8cba-43c4-b1c2-949ef219da9b';
  // const result = await getQuestionsOfTheQuiz(aQuizId);
  // // console.log('result :>> ', result);
  // for (const que of result) {
  //   console.log(que.id, 'que.title :>> ', que.title);
  //   for (const ans of await getAnswersOfTheQuestion(que.id)) {
  //     console.log('   answer :>> ', ans);
  //   }
  // }
  const aQuizId = '3e439775-8cba-43c4-b1c2-949ef219da9b';
  const source = await Query.getQuestionsOfTheQuiz(aQuizId);
  if (!!source) {
    console.log('source.length :>> ', source.length);
  }
  // for (const q of source) {
  //   console.log(`${q.questionOrder} :>>`, q);
  // }
}

/*  super oldu silme  */
/* const quizListOfUser = await getQuizList(userId);
  for (const quiz of quizListOfUser) {
    console.log('quiz.title :>>', quiz.title, quiz.id);
    for (const question of await quiz.getQuestions({ order: ['questionOrder'] })) {
      console.log('#', question.questionOrder, ' question.title :>>', question.title, question.id);
      let ansNum = 1;
      for (const answer of await question.getAnswers()) {
        console.log(ansNum++, ' answer.title :>>', answer.title, answer.isCorrect);
      }
    }
  } */

// console.log(await quizListOfUser[0].getQuestions());
// console.log(Sequelize.getValues(await quizListOfUser[0].getQuestions()));
// console.log(await getQuizList(userId));

// console.log(await getSharedQuizList(userId));

// grab full details of a given quiz including answers
// const aQuiz = await Quiz.findByPk(aQuizId);
// const questions = [];
// console.log('aQuiz :>>', aQuiz.title, '***');

// for (const question of await aQuiz.getQuestions({
//   attributes: [
//     'id',
//     'questionOrder',
//     'title',
//     'imgURL',
//     'createdAt',
//     // 'questionTypeId',
//     [sequelize.fn('COUNT', sequelize.col('Answers.id')), 'numberOfChoices'],
//     [sequelize.fn('MAX', sequelize.col('TimeLimit.value')), 'timer'],
//     [sequelize.fn('MAX', sequelize.col('QuestionType.title')), 'qType'],
//   ],
//   include: [
//     {
//       model: Answer,
//       // attributes: [],
//     },
//     {
//       model: QuestionType,
//       attributes: [],
//     },
//     {
//       model: TimeLimit,
//       attributes: [],
//     },
//   ],
//   group: [
//     'Question.id',
//     'Question.questionOrder',
//     'Question.title',
//     'Question.imgURL',
//     'Question.createdAt',
//   ],
// })) {
// for (const question of await aQuiz.getQuestions({
//   include: [{ model: Answer }, { model: QuestionType }, { model: TimeLimit }],
//   order: ['questionOrder'],
// })) {
// questions.push(question.toJSON());
// console.log('item:>> ', question.toJSON());
// console.log('#', question.questionOrder, ' question.title :>>', question.title, question.id);
// let ansNum = 1;
// for (const answer of await question.getAnswers()) {
//   console.log(ansNum++, ' answer.title :>>', answer.title, answer.isCorrect);
// }

// console.log('questions :>> ', questions);
// console.log('questions :>> ', questions[0].Answers[0].title);

// console.log(aQuiz[2].dataValues.Answers.length);
// console.log(aQuiz[0].Answers[1]);

// async function getAnswersOfTheQuestion(theQuestionId) {
//   if (theQuestionId == null) {
//     throw new Error('no questionId is given');
//   }
//   const theQuestion = await Question.findByPk(theQuestionId);
//   const answerArray = [];
//   for (const answer of await theQuestion.getAnswers({ order: sequelize.random() })) {
//     answerArray.push(answer.toJSON());
//   }
//   return answerArray;
// }

/*
async function getQuestionsOfTheQuiz(theQuizId) {
  if (theQuizId == null) {
    throw new Error('no quizId is given');
  }
  const theQuiz = await Quiz.findByPk(theQuizId);
  const questionArray = [];
  for (const question of await theQuiz.getQuestions({
    attributes: [
      'id',
      'questionOrder',
      'title',
      'imgURL',
      'createdAt',
      // 'questionTypeId',
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
    let ansNum = 1;
    for (const answer of await getAnswersOfTheQuestion(question.id)) {
      // console.log(ansNum++, ' answer.title :>>', answer.title, answer.isCorrect);
      answerArray.push(answer);
    }
    // for (const answer of await question.getAnswers({ order: sequelize.random() })) {
    //   // console.log(ansNum++, ' answer.title :>>', answer.title, answer.isCorrect);
    //   answerArray.push(answer.toJSON());
    // }
    question.answers = answerArray;
    questionArray.push(question.toJSON());
  }
  return questionArray;
  // return Sequelize.getValues(questionArray);
}

async function getQuizzesOfTheUser(theUserId) {
  if (theUserId == null) {
    throw new Error('no userId is given');
  }
  const theUser = await User.findByPk(theUserId);
  const quizArray = [];
  for (const quiz of await theUser.getQuizzes({
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
    order: ['createdAt', 'DESC'],
  })) {
    quizArray.push(quiz.toJSON());
  }
  return quizArray;
  // return Sequelize.getValues(quizArray);
}

async function getQuizzesOfOtherUsers(theUserId) {
  if (theUserId == null) {
    throw new Error('no userId is given');
  }
  const theUser = await User.findByPk(theUserId);
  const quizArray = [];
  for (const quiz of await theUser.getQuizzes({
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
  return quizArray;
  // return Sequelize.getValues(quizArray);
}

async function getQuiz(quizId) {
  let questionList;
  try {
    questionList = await Question.findAll({
      where: {
        quizId: quizId,
      },
      attributes: [
        'id',
        'questionOrder',
        'title',
        'imgURL',
        'createdAt',
        // 'questionTypeId',
        [sequelize.fn('COUNT', sequelize.col('Answers.id')), 'numberOfAnswers'],
      ],
      include: [
        {
          model: Answer,
          // attributes: [],
        },
        {
          model: QuestionType,
          // attributes: ['title'],
        },
        {
          model: TimeLimit,
          // attributes: ['value'],
        },
      ],
      group: [
        'Question.id',
        'Question.questionOrder',
        'Question.title',
        'Question.imgURL',
        'Question.createdAt',
      ],
    });
  } catch (error) {
    console.log('error :>> ', error);
  }
  // return questionList;
  return Sequelize.getValues(questionList);
}
 */
main();
