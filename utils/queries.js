/*
 * sequelize queries for fetching
 * quizzes, questions, answers
 */

const {
  User,
  Quiz,
  Question,
  Answer,
  QuestionType,
  TimeLimit,
  PlayerAnswer,
  sequelize,
} = require('../db/models');
const { Op } = require('sequelize');

class Query {
  static async connectToDatabase() {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  static async getQuizzesOfUser(theUserId) {
    if (theUserId == null) {
      throw new Error('no userId is given');
    }
    const theUser = await User.findByPk(theUserId);
    const count = await Quiz.count({
      where: {
        composerId: theUserId,
        isDraft: false,
      },
    });
    const rows = [];
    if (!theUser) {
      return null;
    }
    for (const quiz of await Quiz.findAll({
      where: {
        composerId: theUserId,
        isDraft: false,
      },
      attributes: [
        'id',
        'text',
        'imgURL',
        'createdAt',
        'composerId',
        [sequelize.fn('MAX', sequelize.col('User.userName')), 'composerName'],
        [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'numberOfQuestions'],
      ],
      include: [
        {
          model: Question,
          attributes: [],
        },
        {
          model: User,
          attributes: [],
        },
      ],
      group: ['Quiz.id', 'Quiz.text', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
      order: [['createdAt', 'DESC']],
    })) {
      rows.push(quiz.toJSON());
    }
    return { count, rows };
  }

  static async getDraftQuizzesOfUser(theUserId) {
    if (theUserId == null) {
      throw new Error('no userId is given');
    }
    const theUser = await User.findByPk(theUserId);
    const count = await Quiz.count({
      where: {
        composerId: theUserId,
        isDraft: true,
      },
    });
    const rows = [];
    if (!theUser) {
      return null;
    }
    for (const quiz of await Quiz.findAll({
      where: {
        composerId: theUserId,
        isDraft: true,
      },
      attributes: [
        'id',
        'text',
        'imgURL',
        'createdAt',
        'composerId',
        [sequelize.fn('MAX', sequelize.col('User.userName')), 'composerName'],
        [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'numberOfQuestions'],
      ],
      include: [
        {
          model: Question,
          attributes: [],
        },
        {
          model: User,
          attributes: [],
        },
      ],
      group: ['Quiz.id', 'Quiz.text', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
      order: [['createdAt', 'DESC']],
    })) {
      rows.push(quiz.toJSON());
    }
    return { count, rows };
  }

  static async getQuizzesOfOtherUsers(theUserId) {
    if (theUserId == null) {
      throw new Error('no userId is given');
    }
    const count = await Quiz.count({
      where: {
        composerId: {
          [Op.ne]: theUserId,
        },
        isDraft: false,
        isVisible: true,
      },
    });
    const rows = [];
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
        'text',
        'imgURL',
        'createdAt',
        'composerId',
        [sequelize.fn('MAX', sequelize.col('User.userName')), 'composerName'],
        [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'numberOfQuestions'],
      ],
      include: [
        {
          model: Question,
          attributes: [],
        },
        {
          model: User,
          attributes: [],
        },
      ],
      group: ['Quiz.id', 'Quiz.text', 'Quiz.imgURL', 'Quiz.createdAt', 'composerId'],
      order: [['createdAt', 'DESC']],
    })) {
      rows.push(quiz.toJSON());
    }
    return { count, rows };
  }

  static async getQuestionsOfQuiz(theQuizId) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    const theQuiz = await Quiz.findByPk(theQuizId);
    const count = await Question.count({ where: { quizId: theQuizId } });
    const rows = [];
    if (!theQuiz) {
      return null;
    }
    for (const question of await Question.findAll({
      where: { quizId: theQuizId },
      attributes: [
        'id',
        'quizId',
        'questionOrder',
        'text',
        'imgURL',
        'createdAt',
        'questionTypeId',
        'timeLimitId',
        [sequelize.fn('COUNT', sequelize.col('Answers.id')), 'numberOfChoices'],
        [sequelize.fn('MAX', sequelize.col('TimeLimit.value')), 'timer'],
        [sequelize.fn('MAX', sequelize.col('QuestionType.value')), 'qType'],
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
        'Question.quizId',
        'Question.questionOrder',
        'Question.text',
        'Question.imgURL',
        'Question.createdAt',
        'Question.questionTypeId',
        'Question.timeLimitId',
      ],
      order: ['questionOrder'],
    })) {
      rows.push(question.toJSON());
    }
    return { count, rows };
  }

  static async getQuestionsOfQuizWithAnswers(theQuizId, random = false) {
    const { count, rows } = await this.getQuestionsOfQuiz(theQuizId);
    for (const question of rows) {
      question.Answers = await this.getAnswersOfQuestion(question.id, random);
    }
    return { count, rows };
  }

  static async getQuestionOfQuizByQNumber(theQuizId, qNumber) {
    const theQuestion = await Question.findOne({ where: { quizId: theQuizId, questionNumber: qNumber } });
    return theQuestion.toJSON();
  }

  static async getQuestionOfQuizByQNumberWithAnswers(theQuizId, qNumber) {
    const theQuestion = (
      await Question.findOne({
        where: { quizId: theQuizId, questionNumber: qNumber },
      })
    ).toJSON();
    theQuestion.Answers = await this.getAnswersOfQuestion(theQuestion.id);
    return theQuestion;
  }

  static async getQuizDetails(theQuizId) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    return (await Quiz.findByPk(theQuizId)).toJSON();
  }

  static async updateQuizDetails(theQuizId, details) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    if (details == null) {
      throw new Error('no detail data is given');
    }
    await Quiz.update(details, { where: { id: theQuizId } });
  }

  static async getQuizDataset(theQuizId) {
    const details = await this.getQuizDetails(theQuizId);
    const { count, rows } = await this.getQuestionsOfQuizWithAnswers(theQuizId);
    return { details, count, rows };
  }

  static async updateQuizDataset(theQuizId, dataset) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    if (dataset == null) {
      throw new Error('no dataset is given');
    }
    await this.updateQuizDetails(theQuizId, dataset.details);
    await this.updateQuizQuestions(theQuizId, dataset.rows);
  }

  static async updateQuizQuestions(theQuizId, dataset) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    if (dataset == null) {
      throw new Error('no dataset is given');
    }
    await Question.bulkCreate(dataset, {
      updateOnDuplicate: [
        'text',
        'questionTypeId',
        'imgURL',
        'imgAltText',
        'imgCredit',
        'timeLimitId',
        'questionOrder',
      ],
      include: [
        {
          model: Answer,
          updateOnDuplicate: [
            'questionTypeId',
            'text',
            'imgURL',
            'imgAltText',
            'imgCredit',
            'timeLimitId',
            'questionOrder',
          ],
        },
      ],
    });
  }

  static async deleteQuizQuestions(questionsToBeDeleted) {
    if (questionsToBeDeleted == null) {
      throw new Error('no questionlist is given');
    }
    await Question.destroy({
      where: {
        id: {
          [Op.in]: questionsToBeDeleted,
        },
      },
    });
  }

  static async deleteQuizzes(quizzesToBeDeleted) {
    if (quizzesToBeDeleted == null) {
      throw new Error('no quizlist is given');
    }
    await Quiz.destroy({
      where: {
        id: {
          [Op.in]: quizzesToBeDeleted,
        },
      },
    });
  }

  static async getAnswersOfQuestion(theQuestionId, random = true) {
    if (theQuestionId == null) {
      throw new Error('no questionId is given');
    }
    const theQuestion = await Question.findByPk(theQuestionId);
    const rows = [];
    for (const answer of await Answer.findAll({
      where: { questionId: theQuestionId },
      order: random ? sequelize.random() : '',
    })) {
      rows.push(answer.toJSON());
    }
    return rows;
  }

  static async getQuestion(theQuestionId) {
    const theQuestion = await Question.findOne({ where: { id: theQuestionId } });
    return theQuestion.toJSON();
  }

  static async getQuestionWithAnswers(theQuestionId) {
    if (theQuestionId == null) {
      throw new Error('no questionId is given');
    }
    const theQuestion = (await Question.findByPk(theQuestionId)).toJSON();
    theQuestion.Answers = await this.getAnswersOfQuestion(theQuestionId);
    return theQuestion;
  }

  static async getAnswersOfQuestionByQuizIdAndQNumber(theQuizId, qNumber) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    const theQuestion = await Question.findOne({ where: { quizId: theQuizId, questionNumber: qNumber } });
    const count = await Answer.count({ where: { questionId: theQuestion.id } });
    const rows = [];
    for (const answer of await Answer.findAll({
      where: { questionId: theQuestion.id },
      order: sequelize.random(),
    })) {
      rows.push(answer.toJSON());
    }
    return { count, rows };
  }

  static async isAnswerCorrect(theAnswerId) {
    if (theAnswerId == null) {
      throw new Error('no AnswerId is given');
    }
    const result = await Answer.findByPk(theAnswerId);
    return result.isCorrect;
  }

  static async isQuizEditable(theQuizId, theUserId) {
    if (theQuizId == null) {
      throw new Error('no AnswerId is given');
    }
    const result = await Quiz.findOne({ where: { id: theQuizId, composerId: theUserId } });
    return !!result;
  }

  static async savePlayerQuestionScore(playerId, gameId, questionId, answerId, questionScore) {
    try {
      await PlayerAnswer.create({
        playerId,
        gameId,
        questionId,
        answerId,
        questionScore,
      });
      return true;
    } catch (error) {
      console.log('error :>> ', error);
      return false;
    }
  }

  static async savePlayerGameScore(playerId, gameId, questionId, gameScore) {
    try {
      await Player.create({
        playerId,
        gameId,
        questionId,
        gameScore,
      });
      return true;
    } catch (error) {
      console.log('error :>> ', error);
      return false;
    }
  }
}
module.exports = {
  Query,
};
