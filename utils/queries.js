/*
 * sequelize queries for fetching
 * quizzes, questions, answers
 */

const { User, Quiz, Question, Answer, QuestionType, TimeLimit, sequelize } = require('../db/models');
const { Op } = require('sequelize');

class Query {
  static async connectToDatabase() {
    await sequelize.authenticate();
  }

  static async getQuizzesOfTheUser(theUserId) {
    if (theUserId == null) {
      throw new Error('no userId is given');
    }
    const theUser = await User.findByPk(theUserId);
    const quizArray = [];
    if (!theUser) {
      return null;
    }
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
        },
      ],
      group: ['Quiz.id', 'Quiz.title', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
      order: [['createdAt', 'DESC']],
    })) {
      quizArray.push(quiz.toJSON());
    }
    return quizArray;
  }

  static async getQuizzesOfOtherUsers(theUserId) {
    if (theUserId == null) {
      throw new Error('no userId is given');
    }
    // const theUser = await User.findByPk(theUserId);
    const quizArray = [];
    for (const quiz of await User.getQuizzes({
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
  }

  static async getQuestionsOfTheQuiz(theQuizId) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    const theQuiz = await Quiz.findByPk(theQuizId);
    const questionArray = [];
    if (!theQuiz) {
      return null;
    }
    for (const question of await theQuiz.getQuestions({
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
          attributes: [],
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
      questionArray.push(question.toJSON());
    }
    return questionArray;
  }

  /* 
  static async quizExists(theQuizId) {
    try {
      const result = await Quiz.findByPk(theQuizId);
      return !!result;
    } catch (error) {
      console.log('error :>> ', error);
    }
  }
 */

  static async getAnswersOfTheQuestion(theQuestionId) {
    if (theQuestionId == null) {
      throw new Error('no questionId is given');
    }
    const theQuestion = await Question.findByPk(theQuestionId);
    const answerArray = [];
    for (const answer of await theQuestion.getAnswers({
      order: sequelize.random(),
    })) {
      answerArray.push(answer.toJSON());
    }
    return answerArray;
  }

  static async getQuestionsWithAnswers(theQuizId) {
    const questionList = await this.getQuestionsOfTheQuiz(theQuizId);
    for (const question of questionList) {
      question.answers = await this.getAnswersOfTheQuestion(question.id);
    }
    return questionList;
  }

  static async getOneQuestionWithAnswers(theQuizId, qNumber) {
    const questionList = await this.getQuestionsOfTheQuiz(theQuizId);
    for (const question of questionList) {
      question.answers = await this.getAnswersOfTheQuestion(question.id);
    }
    if (qNumber > questionList.length) {
      return null;
    }
    return questionList[qNumber - 1];
  }
}
module.exports = {
  Query,
};
/* 
{
getQuizzesOfTheUser,
getQuizzesOfOtherUsers,
getQuestionsOfTheQuiz,
getAnswersOfTheQuestion,
};
*/
