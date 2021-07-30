const path = require('path');

const { User, Quiz, Question, Answer, QuestionType, TimeLimit, sequelize } = require('./db/models');
const { Op } = require('sequelize');
const { Query } = require('./utils/queries');

const userId = 'ab9e21ea-ff11-47ff-9d8a-23c2f71f3eaa';
const aQuizId = 'c82f173a-a479-4d75-96de-a9bc88a27ed9';
const aQuestionId = '43664bf2-9f42-4bc4-a9cf-e73241aa4a3e';
const anAnswerId = '2';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  try {
    // const anAnswer = await Answer.findOne({ where: { questionId: aQuestionId, id: anAnswerId }, raw: true });
    // console.log('anAnswer :>> ', anAnswer);
    const { count, rows } = await Query.getQuestionsOfQuizWithAnswers(aQuizId, false);
    console.log('question count :>> ', count);
    for (const r of rows) {
      console.log('r:>> ', r);
      // r.title = 'qqqqqqqqqqqqqq';
      console.log('questtion :>> ', r.questionOrder, r.text);
      // for (const a of r.Answers) {
      // if (a.isCorrect) {
      // }
      // a.title = 'hahahaaaa';
      // console.log('answer :>> ', a.title, a.isCorrect ? '✅' : '');
      // }
    }
    /*   await Question.bulkCreate(rows, {
      updateOnDuplicate: ['title'],
      include: [{ model: Answer, updateOnDuplicate: ['title'] }],
    }); */
    // console.log('anAnswer.getQuestion() :>>', await anAnswer.getQuestion());
    // const qu = await Question.findOrCreate({
    //   where: { title: '22my new Question3' },
    //   defaults: { quizId: aQuizId, questionTypeId: 1, timeLimitId: 4 },
    // });
    // const ans = await Answer.create({ questionId: qu[0].id, title: '******ddd ion' });
    // const aa = await Answer.findOrCreate({
    //   where: { questionId: qu[0].id },
    //   defaults: { questionId: qu[0].id, title: 'zzzzz****ddd ion' },
    // });
    // console.log('qu[0] :>>', qu[0]);
    // const qu = await anAnswer.createQuestion({
    //   quizId: aQuizId,
    //   questionTypeId: 2,
    //   title: 'new question',
    //   timeLimitId: 3,
    // });
    // console.log('qu :>> ', qu);

    // const aQuestion = await Question.findByPk(aQuestionId);
    // console.log('aQuestion.getAnswers() :>>', await aQuestion.getAnswers());
    // console.log('aQuestion.hasAnswer(anAnswerId) :>>', await aQuestion.hasAnswer(anAnswerId));
    // console.log(
    //   'aQuestion.hasAnswers(["cc6cc7fd-69d5-4c39-9901-35a1c79ffb9e","5d713c49-1a53-43ae-b8d8-a082b95daf4a","fcd3cf61-7818-4f3a-8fee-96493562a459"]) :>>',
    //   await aQuestion.hasAnswers([
    //     'cc6cc7fd-69d5-4c39-9901-35a1c79ffb9e',
    //     '5d713c49-1a53-43ae-b8d8-a082b95daf4a',
    //     'fcd3cf61-7818-4f3a-8fee-96493562a459',
    //   ])
    // );
    // console.log('aQuestion.countAnswers() :>>', await aQuestion.countAnswers());
    // console.log('aQuestion.getQuestionType() :>>', await aQuestion.getQuestionType());
    // console.log('aQuestion.getTimeLimit() :>>', await aQuestion.getTimeLimit());
    // console.log('aQuestion.getQuiz() :>>', await aQuestion.getQuiz());
  } catch (error) {
    console.log('error :>> ', error);
  }
  // const qnaJson = await Query.getOneQuestionWithAnswers(aQuestionId);
  // const result = await Query.getQuizzesOfTheUser(userId);
  // const result = await Query.getDraftQuizzesOfTheUser(userId);
  // qnaJson.title = 'NEW TITLE IS GIVEN';

  // console.log('qnaJson :>> ', qnaJson);
  // qnaJson.answers[0].title = 'new title for answer 1';
  // try {
  //   for (const ans of qnaJson.answers) {
  //     const an = await Answer.findOrCreate({ where: { questionId: aQuestionId }, defaults: { ...ans } });
  //     console.log('an :>> ', an.toJSON());
  //   }
  // const q1 = await Question.findOrCreate({ where: { id: aQuestionId }, defaults: { ...qnaJson } });
  // console.log('q1.toJSON() :>> ', q1);
  // } catch (error) {
  //   console.log('error :>> ', error);
  // }
  // const queInstance = Question.findOrCreate(qnaJson);
  // console.log('queInstance :>> ', queInstance);
  // // console.log('result :>> ', result);
  // for (const que of result) {
  //   console.log(que.id, 'que.title :>> ', que.title);
  //   for (const ans of await getAnswersOfTheQuestion(que.id)) {
  //     console.log('   answer :>> ', ans);
  //   }
  // }
  // const aQuizId = '3e439775-8cba-43c4-b1c2-949ef219da9b';
  // const source = await Query.getQuestionsOfTheQuiz(aQuizId);
  // if (!!source) {
  //   console.log('source.length :>> ', source.length);
  // }
  // for (const q of source) {
  //   console.log(`${q.questionOrder} :>>`, q);
  // }
}

main();
