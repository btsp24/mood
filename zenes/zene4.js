const { User, Quiz, Question, Answer, sequelize } = require('./db/models');
const { Query } = require('./utils/queries');

const userId = 'ab9e21ea-ff11-47ff-9d8a-23c2f71f3eaa';
const aQuizId = 'c82f173a-a479-4d75-96de-a9bc88a27ed9';
const aQuestionId = '43664bf2-9f42-4bc4-a9cf-e73241aa4a3e';
const anAnswerId = '2';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('👍connected');
    // const aUser = User.build({ userName: 'Osman Tas', email: 'tasosman@gmail.com', password: 'Password' });
    // await aUser.save();
    // console.log('aUser :>> ', aUser);
    const { info, count, rows } = await Query.getQuizDataset(aQuizId);
    // console.log('info :>> ', info);
    // console.log('---------');
    // console.log('count :>> ', count);
    console.log('===========');
    for (const q of rows) {
      for (const a of q.Answers) {
        console.log('answer :>>', a.id, a.text, a.isCorrect);
      }
    }
  } catch (error) {
    console.log('---------');
    console.log('⛔ error :>> ', error);
  }
}

main();

async function addQuiz() {
  try {
    await sequelize.authenticate();
    console.log('👍connected');
    const [found] = await Quiz.findOrCreate({
      where: { composerId: 'c7f4adda-b0d4-446f-aab1-9c6baf018075', title: 'Python' },
      defaults: {
        title: 'Python',
        composerId: 'c7f4adda-b0d4-446f-aab1-9c6baf018075',
        lobbyMusicId: 4,
      },
    });
    const f2 = await Question.findOrCreate({
      where: { quizId: found.id, questionOrder: 2 },
      defaults: {
        quizId: found.id,
        questionTypeId: 2,
        title: 'some titl111e',
        questionOrder: 2,
        timeLimitId: 4,
      },
    });
    f2.title = 'hahahaha';
    await f2.save();
    for (const aQuestion of f2) {
      console.log('aQuestion :>> ', aQuestion);
    }

    // for (const que of found) {
    //   console.log('que :>> ', que.id);
    //   const f2 = await Question.findAll({ where: { quizId: que.id } });
    //   for (const ques of f2) {
    //     console.log('que :>> ', ques);
    //   }
    // }
    /*     console.log('aqz :>> ', aqz.id);
    await aqz.addQuestion(
      await Question.create({
        quizId: aqz.id,
        title: 'result of the code?',
        questionTypeId: 2,
        timeLimitId: 4,
        questionOrder: 2,
      })
    );
    console.log('aqz.getQuestions() :>> ', await aqz.getQuestions()); */
  } catch (error) {
    console.log('🚫error :>> ', error);
  }
}

// addQuiz();
