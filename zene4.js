const { User, Quiz, Question, Answer, sequelize } = require('./db/models');
const { Query } = require('./utils/queries');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('👍connected');
    // const aUser = User.build({ userName: 'Osman Tas', email: 'tasosman@gmail.com', password: 'Password' });
    // await aUser.save();
    // console.log('aUser :>> ', aUser);
    const answers = await Query.getAnswersOfTheQuestion('574231b2-84f8-4b0f-a15d-103bc99fcd49');
    answers.forEach(a => {
      a.title = 'new Title';
    });

    console.log('answers :>> ', answers);
    await Answer.bulkCreate(answers, { updateOnDuplicate: ['title'] });
  } catch (error) {
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
