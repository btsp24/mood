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
  Player,
  PlayerAnswer,
  sequelize,
} = require("../db/models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
class Query {
  static async connectToDatabase() {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  }

  static async getQuizzesOfUser(theUserId) {
    if (theUserId == null) {
      throw new Error("no userId is given");
    }
    const theUser = await User.findByPk(theUserId);
    const count = await theUser.countQuizzes({
      where: {
        composerId: theUserId,
        isDraft: false,
      },
    });
    const rows = [];
    if (!theUser) {
      return null;
    }
    for (const quiz of await theUser.getQuizzes({
      where: {
        composerId: theUserId,
        isDraft: false,
      },
      attributes: [
        "id",
        "title",
        "imgURL",
        "updatedAt",
        "composerId",
        "isDraft",
        [sequelize.fn("MAX", sequelize.col("User.userName")), "composerName"],
        [
          sequelize.fn("COUNT", sequelize.col("Questions.id")),
          "numberOfQuestions",
        ],
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
      group: [
        "Quiz.id",
        "Quiz.title",
        "Quiz.imgURL",
        "Quiz.updatedAt",
        "composerId",
        "isDraft",
      ],
      order: [["updatedAt", "DESC"]],
      raw: true,
    })) {
      console.log(quiz);
      //const rec = quiz.toJSON();
      quiz.editEnabled = true;
      rows.push(quiz);
    }
    return { count, rows };
  }

  static async getDraftQuizzesOfUser(theUserId) {
    if (theUserId == null) {
      throw new Error("no userId is given");
    }
    const theUser = await User.findByPk(theUserId);
    const count = await theUser.countQuizzes({
      where: {
        composerId: theUserId,
        isDraft: true,
      },
    });
    const rows = [];
    if (!theUser) {
      return null;
    }
    for (const quiz of await theUser.getQuizzes({
      where: {
        composerId: theUserId,
        isDraft: true,
      },
      attributes: [
        "id",
        "title",
        "imgURL",
        "updatedAt",
        "composerId",
        "isDraft",
        [sequelize.fn("MAX", sequelize.col("User.userName")), "composerName"],
        [
          sequelize.fn("COUNT", sequelize.col("Questions.id")),
          "numberOfQuestions",
        ],
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
      group: [
        "Quiz.id",
        "Quiz.title",
        "Quiz.imgURL",
        "Quiz.updatedAt",
        "composerId",
        "isDraft",
      ],
      order: [["updatedAt", "DESC"]],
      raw: true,
    })) {
      //const rec = quiz.toJSON();
      quiz.editEnabled = true;
      rows.push(quiz);
    }
    return { count, rows };
  }

  static async getQuizzesOfOtherUsers(composerId) {
    if (composerId == null) {
      throw new Error('no userId is given');
    }
    const theUser = await User.findByPk(composerId);
    const count = await Quiz.count({
      where: {
        composerId: {
          [Op.ne]: composerId,
        },
        isDraft: false,
        isVisible: true,
      },
    });
    const rows = [];
    for (const quiz of await Quiz.findAll({
      where: {
        composerId: {
          [Op.ne]: composerId,
        },
        isDraft: false,
        isVisible: true,
      },
      attributes: [
        'id',
        'title',
        'imgURL',
        'imgAltText',
        'updatedAt',
        'composerId',
        'isDraft',
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
      group: ['Quiz.id', 'Quiz.title', 'Quiz.imgURL', 'Quiz.updatedAt', 'composerId', 'isDraft'],
      order: [['updatedAt', 'DESC']],
      raw: true,
    })) {
      // const rec = quiz.toJSON();
      // rec.editEnabled = false;
      quiz.editEnabled = false;
      // rows.push(rec);
      rows.push(quiz);
    }
    return { count, rows };
  }

  static async getQuestionsOfQuiz(theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }

    const theQuiz = await Quiz.findByPk(theQuizId.id);
    const count = await theQuiz.countQuestions();
    const rows = [];
    if (!theQuiz) {
      return null;
    }
    for (const question of await theQuiz.getQuestions({
      where: { quizId: theQuizId.id },
      attributes: [
        "quizId",
        "id",
        "text",
        "questionOrder",
        [sequelize.fn("MAX", sequelize.col("QuestionType.value")), "qType"],
        [sequelize.fn("MAX", sequelize.col("TimeLimit.value")), "timer"],
        [sequelize.fn("COUNT", sequelize.col("Answers.id")), "numberOfChoices"],
        "questionTypeId",
        "timeLimitId",
        "imgURL",
        "imgAltText",
        "imgCredit",
        "createdAt",
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
        "Question.quizId",
        "Question.id",
        "Question.questionOrder",
        "Question.text",
        "Question.imgURL",
        "Question.imgAltText",
        "Question.imgCredit",
        "Question.createdAt",
        "Question.questionTypeId",
        "Question.timeLimitId",
      ],
      order: ["questionOrder"],
      raw: true,
    })) {
      rows.push(question);
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
    return Question.findOne({
      where: { quizId: theQuizId, questionOrder: qNumber },
      raw: true,
    });
  }

  static async getQuestionOfQuizByQNumberWithAnswers(
    theQuizId,
    qNumber,
    random = false
  ) {
    const question = await this.getQuestionOfQuizByQNumber(theQuizId, qNumber);
    question.Answers = await this.getAnswersOfQuestion(question.id, random);
    return question;
  }

  static async getQuizDataset(theQuizId) {
    const details = await this.getQuizDetails(theQuizId);
    const { count, rows } = await this.getQuestionsOfQuizWithAnswers(theQuizId);
    return { details, count, rows };
  }

  static async getQuizDetails(theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }
    return await Quiz.findByPk(theQuizId, { raw: true }); /* .toJSON(); */
  }

  static async cloneQuizDataset(dataset, newComposerId) {
    if (newComposerId == null) {
      throw new Error("no composerId is given");
    }
    if (dataset == null) {
      throw new Error("no dataset is given");
    }
    const newQuiz = await Quiz.create({
      composerId: newComposerId,
      title: dataset.details.title,
      description: dataset.details.description,
      isVisible: dataset.details.isVisible,
      imgURL: dataset.details.imgURL,
      imgAltText: dataset.details.imgAltText,
      imgCredit: dataset.details.imgCredit,
      lobbyMusicId: dataset.details.lobbyMusicId,
      lobbyVideo: dataset.details.lobbyVideo,
      isDraft: dataset.details.isDraft,
    });

    await this.cloneQuizQuestions(dataset.rows, newQuiz.id);
    return newQuiz.id;
  }

  static async cloneQuizQuestions(rows, theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }
    if (rows == null) {
      throw new Error("no row data is given");
    }
    for (const question of rows) {
      const newQuestionId = uuidv4();
      question.id = newQuestionId;
      question.quizId = theQuizId;
      question.updatedAt = null;
      for (const answer of question.Answers) {
        const newAnswerId = uuidv4();
        answer.questionId = newQuestionId;
        answer.id = newAnswerId;
        answer.updatedAt = null;
      }
    }
    await Question.bulkCreate(rows, {
      include: [
        {
          model: Answer,
        },
      ],
    });
  }

  static async updateQuizDataset(dataset, theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }
    if (dataset == null) {
      throw new Error("no dataset is given");
    }
    await this.updateQuizDetails(dataset.details, theQuizId);
    await this.updateQuizQuestions(dataset.rows, theQuizId);
  }

  static async updateQuizDetails(details, theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }
    if (details == null) {
      throw new Error("no detail data is given");
    }
    await Quiz.update(details, { where: { id: theQuizId } });
  }

  static async updateQuizQuestions(rows, theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizId is given");
    }
    if (rows == null) {
      throw new Error("no dataset is given");
    }
    await Question.bulkCreate(rows, {
      updateOnDuplicate: [
        "text",
        "questionOrder",
        "questionTypeId",
        "timeLimitId",
        "imgURL",
        "imgAltText",
        "imgCredit",
      ],
      include: [
        {
          model: Answer,
          updateOnDuplicate: ["text", "answerOrder", "isCorrect"],
        },
      ],
    });
  }

  static async deleteUser(userToDelete) {
    if (userToDelete == null) {
      throw new Error("no userid is given");
    }
    const quizzesToDelete = (
      await Quiz.findAll({
        where: { composerId: userToDelete },
        attributes: ["id"],
        raw: true,
      })
    ).map((q) => q.id);
    // console.log('quizzesToDelete :>> ', quizzesToDelete);
    // delete quizzes
    await this.deleteQuizzes(quizzesToDelete);
    // delete user
    await User.destroy({
      where: {
        id: userToDelete,
      },
    });
  }

  static async deleteQuizzes(quizzesToDelete) {
    if (quizzesToDelete == null) {
      throw new Error("no quizlist is given");
    }
    // delete questions
    const questionsToDelete = (
      await Question.findAll({
        where: { quizId: { [Op.in]: quizzesToDelete } },
        attributes: ["id"],
        raw: true,
      })
    ).map((q) => q.id);
    await this.deleteQuizQuestions(questionsToDelete);

    await Quiz.destroy({
      where: {
        id: {
          [Op.in]: quizzesToDelete,
        },
      },
    });
  }

  static async deleteQuizQuestions(questionsToDelete) {
    if (questionsToDelete == null) {
      throw new Error("no questionlist is given");
    }
    // console.log('dqq-questionsToDelete :>> ', questionsToDelete);
    // delete answers
    await this.deleteQuestionAnswers(questionsToDelete);
    await Question.destroy({
      where: {
        id: {
          [Op.in]: questionsToDelete,
        },
      },
    });
  }

  static async deleteQuestionAnswers(questionsToDelete) {
    if (questionsToDelete == null) {
      throw new Error("no questionList is given");
    }
    await Answer.destroy({
      where: {
        questionId: {
          [Op.in]: questionsToDelete,
        },
      },
    });
  }

  static async getAnswersOfQuestion(theQuestionId, random = true) {
    if (theQuestionId == null) {
      throw new Error("no questionId is given");
    }
    return await Answer.findAll({
      where: { questionId: theQuestionId },
      order: random ? sequelize.random() : "",
      raw: true,
    });
  }

  static async getQuestion(theQuestionId) {
    return await Question.findOne({ where: { id: theQuestionId }, raw: true });
  }

  static async getQuestionWithAnswers(theQuestionId) {
    if (theQuestionId == null) {
      throw new Error("no questionId is given");
    }
    const theQuestion = await Question.findByPk(theQuestionId, { raw: true });
    theQuestion.Answers = await this.getAnswersOfQuestion(theQuestionId);
    return theQuestion;
  }

  static async getAnswersOfQuestionByQuizIdAndQNumber(theQuizId, qNumber, random = true) {
    if (theQuizId == null) {
      throw new Error('no quizId is given');
    }
    const theQuiz = await Quiz.findByPk(theQuizId);
    const question = await theQuiz.getQuestions({
      where: { quizId: theQuizId, questionOrder: qNumber },
      attributes: [
        'quizId',
        'id',
        'text',
        'questionOrder',
        [sequelize.fn('MAX', sequelize.col('QuestionType.value')), 'qType'],
        [sequelize.fn('MAX', sequelize.col('TimeLimit.value')), 'timer'],
        [sequelize.fn('COUNT', sequelize.col('Answers.id')), 'numberOfChoices'],
        // 'questionTypeId',
        'timeLimitId',
        'imgURL',
        'imgAltText',
        'imgCredit',
        'createdAt',
      ],
      include: [
        {
          model: TimeLimit,
          attributes: [],
        },
        {
          model: Answer,
          attributes: [],
        },
        {
          model: QuestionType,
          attributes: [],
        },
      ],
      group: [
        'Question.quizId',
        'Question.id',
        'Question.questionOrder',
        'Question.text',
        'Question.imgURL',
        'Question.imgAltText',
        'Question.imgCredit',
        'Question.createdAt',
        'Question.questionTypeId',
        'Question.timeLimitId',
      ],
      order: ['questionOrder'],
      raw: true,
    });
    const count = question[0].questionTypeId == 1 ? 2 : 4;
    // const count = await Answer.count({ where: { questionId: question.id } });
    const rows = [];
    for (const answer of await Answer.findAll({
      where: { questionId: question[0].id },
      order: random ? sequelize.random() : '',
      raw: true,
    })) {
      rows.push(answer);
    }
    return { question: question[0], count, rows };
  }

  static async isAnswerCorrect(questionId, answerId) {
    if (questionId == null && answerId == null) {
      throw new Error("no questionId and AnswerId is given");
    }
    const result = await Answer.findOne({
      where: { questionId, id: answerId },
    });
    return result.isCorrect;
  }

  static async isAnswerCorrectByAnsNum(questionId, answerNum) {
    if (questionId == null && answerId == null) {
      throw new Error("no questionId and AnswerId is given");
    }
    const result = await Answer.findOne({
      where: { questionId, answerOrder: answerNum },
    });
    return result.isCorrect;
  }

  static async isQuizEditable(theQuizId, theUserId) {
    if (theQuizId == null) {
      throw new Error("no AnswerId is given");
    }
    const result = await Quiz.findOne({
      where: { id: theQuizId, composerId: theUserId },
    });
    return !!result;
  }

  static async quizExists(theQuizId) {
    if (theQuizId == null) {
      throw new Error("no quizID is given");
    }
    const result = await Quiz.findOne({ where: { id: theQuizId } });
    return !!result;
  }

  static async savePlayerQuestionScore(
    playerId,
    gameId,
    questionId,
    answerId,
    questionScore
  ) {
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
      console.log("error :>> ", error);
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
      console.log("error :>> ", error);
      return false;
    }
  }
}
module.exports = {
  Query,
};
