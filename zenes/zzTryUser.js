const { User, Quiz, Question, sequelize } = require('./db/models');
const quizInstance = Quiz.build();
// async function addNewUser(userName, email, password) {
//   const res = await User.create({ userName, email, password });
//   console.log(res.toJSON());
//   return res;
// }

// const user = User.findOne({ where: { email: 'tasosman@gmail.com' } });
// // addNewUser('xzxz', 'zxzxzx@gmail.com', '$2b$05$6UxTrmDoyCCld.QiCv/sdu3nj2RPcMQrxlDLueEYEgdxCIQaSssca');

// async function getQuizzes() {
//   let countQuizzes;
//   try {
//     const user = await User.findByPk('92814d58-9d85-493b-8ac8-0bc3ed45faf7');
//     countQuizzes = await user.countQuizzes();
//   } catch (error) {
//     console.log('error :>>', error);
//   }
//   console.log('countQuizzes :>>', countQuizzes);
//   let questionCount;
//   try {
//     const quiz = await Quiz.findByPk('5e77f7b8-9409-48b4-812d-5d576331e03b');
//     questionCount = await quiz.countQuestions();
//   } catch (error) {
//     console.log('error :>>', error);
//   }
//   console.log('questionCount :>>', questionCount);
// }

// getQuizzes();

async function getQuizzes2() {
  const userID = '92814d58-9d85-493b-8ac8-0bc3ed45faf7';

  try {
    const currentUser = await User.findByPk(userID);

    const quizzes = await Quiz.findAll({
      where: { composerId: userID },
    });
    let qz2 = quizzes.map(async qz => {
      let quCount = await qz.countQuestions();
      return { ...qz, quCount };
    });
    console.log('qz2 :>> ', qz2);
  } catch (error) {
    console.log('error :>> ', error);
  }
}

getQuizzes2();
