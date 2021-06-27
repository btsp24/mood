const Op = require('Sequelize').Op;

const { Quiz, Question, User } = require('./db/models');

/*
0. id
1. quizimage
2. quiz title
3. quiz composer
4. createdAt
5. question count
isDraft


*/
const userId = '5658e93d-53d1-4ebe-b936-3dfdf1249caf';
async function myQuizzes(uId) {
  let result = [];
  try {
    result = await Quiz.findAll({
      attributes: ['id', 'title', 'imgURL', 'createdAt'],
      where: { isDraft: false, composerId: uId },
      order: ['id'],
      include: [User, Question],
    });
    console.log(result);
    console.log(result[0].title);
    console.log(result[0].imgURL);
    console.log(result[0].User.userName);
    console.log(result[0].Questions.length);
  } catch (error) {
    console.log('error :>> ', error);
  }
}

// myQuizzes(userId);

async function sharedQuizzes(uId) {
  let result = [];
  try {
    result = await Quiz.findAll({
      attributes: ['id', 'title', 'imgURL', 'createdAt'],
      where: {
        isDraft: false,
        isVisible: true,
        composerId: {
          [Op.ne]: uId,
        },
      },
      order: ['id'],
      include: [User, Question],
    });
    console.log(result.length);
    console.log(result[0].imgURL);
    console.log(result[0].User.userName);
    console.log(result[0].Questions.length);
  } catch (error) {
    console.log('error :>> ', error);
  }
}

sharedQuizzes(userId);
