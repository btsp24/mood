const path = require('path');
const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs');
const passport = require('passport');
const {
  validate: uuidValidate, 
  v4: uuidv4
} = require('uuid');

// Load User model

const {
  User
} = require('../db/models');
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('./isAuth');
const {
  Query
} = require('../utils/queries');

// multer attach
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads'); // set the destination
  },
  filename: function (req, file, callback) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, uniquePrefix + path.extname(file.originalname)); // set the file name and extension
  },
});
const upload = multer({
  storage: storage
});
router.post('/upload', upload.single('file'), function (req, res, next) {
  const img = req.file.filename;
  console.log('img :>> ', img);
  if (!req.file) {
    res.status(500).send({
      error: 'error occured'
    });
    return next(req.originalUrl);
  }

  console.log(req.body)
  console.log(req.files)
  console.log(req.file)

  // res.send('SUCCESS')
  return res.status(200).send(req.file);
});

/* login page */
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('user/login', {
    title: 'login page for teacher',
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});
//
router.post('/register', async (req, res) => {
  const {
    userName,
    email,
    password,
    password2
  } = req.body;
  const errors = [];

  if (!userName || !email || !password || !password2) {
    errors.push({
      msg: 'Please enter all fields',
    });
  }

  if (password !== password2) {
    errors.push({
      msg: 'Passwords do not match',
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters',
    });
  }

  if (errors.length > 0) {
    console.log(errors);
  } else {
    const userFound = await User.findOne({
      where: {
        email,
      },
    });
    if (userFound) {
      errors.push({
        msg: 'Email already exists',
      });
      res.render('register', {
        errors,
        userName,
        email,
        password,
        password2,
      });
    } else {
      try {
        await User.create({
          userName,
          email,
          password,
        });
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');
      } catch (err) {
        console.log('error :>> ', err);
      }
    }
  }
});

/* register page */
router.get('/register', forwardAuthenticated, (req, res) =>
  res.render('user/register', {
    title: 'register page for teacher',
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

router.put('/save/details',
  ensureAuthenticated, async (req, res) => {
    const detailsToSave = JSON.parse(req.body.details);
    const quizIdToSave = detailsToSave.id;
    if (!detailsToSave || !quizIdToSave) {
      res.status(412).send('missing parameters');
      return;
    }
    await Query.updateQuizDetails(detailsToSave, quizIdToSave);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
    // const response = {
    //   status  : 200,
    //   success : 'Updated Successfully'
    // }
    // res.end(JSON.stringify(response));
    // res.status(200).send('success');
  })

router.put('/save/quiz',
  ensureAuthenticated, async (req, res) => {
    const questionsToSave = JSON.parse(req.body.rows);
    const quizIdToSave = req.body.quizId;
    const questionsToDelete = JSON.parse(req.body.questionsToDelete);
    console.log('questionsToDelete :>> ', questionsToDelete);
    if (!questionsToSave || !quizIdToSave) {
      res.status(412).send('missing parameters');
      return;
    }
    Query.deleteQuizQuestions(questionsToDelete);
    Query.updateQuizQuestions(questionsToSave, quizIdToSave);
    // Promise.all([Query.deleteQuizQuestions(questionsToDelete), Query.updateQuizQuestions(questionsToSave, quizIdToSave)]);
    // Query.updateQuizQuestions(questionsToSave, quizIdToSave);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
  })

router.put('/clone/:quizId', ensureAuthenticated, async (req, res) => {
  const oldQuizId = req.params.quizId;
  const userId = req.user.id;
  if (!oldQuizId || !userId) {
    res.status(412).send('missing parameters');
    return;
  }
  try {
    const datasetOld = await Query.getQuizDataset(oldQuizId);
    const newQuizId = await Query.cloneQuiz(datasetOld, userId);
    req.params.quizId = newQuizId;
    res.status(200).redirect(`/home`);
  } catch (error) {
    console.log('error :>> ', error);
  }
});

router.delete('/delete/:quizId', ensureAuthenticated, async (req, res) => {
  const quizToDelete = req.params.quizId;
  console.log('quizzesToDelete :>> ', quizToDelete);
  await Query.deleteQuiz(quizToDelete);
  res.status(200).redirect('/home');
})

// edit route
router.get('/edit/:quizId', ensureAuthenticated, async (req, res) => {
  let dataset;
  const quizId = req.params.quizId;
  const userId = req.user.id;
  if (!quizId || !userId) {
    res.status(412).send('missing parameters');
    return;
  }
  if (!!quizId && uuidValidate(quizId) && (await Query.isQuizEditable(quizId, userId))) {
    // console.log('quizId  :>> ', quizId);
    dataset = await Query.getQuizDataset(quizId);
  }
  res.render('user/edit', {
    title: 'quiz editor page',
    dataset,
  });
});

router.get('/compose', ensureAuthenticated, async (req, res) => {
  const quizId = uuidv4();
  const userId = req.user.id;
  const questionId = uuidv4();
  if (!quizId || !userId) {
    res.status(412).send('missing parameters');
    return;
  }
  const dataset = {};
  dataset.details = {id: quizId, composerId: userId, 
    title: 'New Quiz', isVisible: false, isDraft: true, imgURL: '/images/180x120.png'};
  dataset.rows = [];
  const row = {quizId, id: questionId, text: 'New Question', questionOrder: 1, 
  questionTypeId : 2, timeLimitId: 2, imgURL: '/images/540x360.png',
};
  row.Answers = [
    {questionId, id: uuidv4(), answerOrder:1},
    {questionId, id: uuidv4(), answerOrder:2},
    {questionId, id: uuidv4(), answerOrder:3},
    {questionId, id: uuidv4(), answerOrder:4},
  ]
  dataset.rows.push(row);
  dataset.count = 1;

  res.render('user/edit', {
    title: 'quiz compose page',
    dataset,
  });
});

router.post('/add/details', async (req, res) => {
  const detailsToSave = req.body.details; // {details, rows}
  const quizId = detailsToSave.id;
  if (!detailsToSave || !quizId) {
    res.status(412).send('missing parameters');
    return;
  }
  try {
    await Query.updateQuizDataset(detailsToSave, quizId);
    req.flash('success_msg', 'quiz saved');
    res.status(200).send('success');
  } catch (err) {
    console.log('error :>> ', err);
  }
})

router.post('/add/quiz', async (req, res) => {
  const questionsToSave = req.body.rows;
  const quizIdToSave = req.body.quizId;
  if (!questionsToSave || !quizIdToSave) {
    res.status(412).send('missing parameters');
    return;
  }
  try {
    await Query.updateQuizQuestions(questionsToSave, quizIdToSave)
    req.flash('success_msg', 'quiz saved');
    res.status(200).send('success');
  } catch (err) {
    console.log('error :>> ', err);
  }
});

/* home page  for teacher */
router.get('/home', ensureAuthenticated, async (req, res) => {
  res.app.locals.user = req.user;
  const myQuizzes = await Query.getQuizzesOfUser( /* aUserId */ req.user.id);
  const myDraftQuizzes = await Query.getDraftQuizzesOfUser( /* aUserId */ req.user.id);
  const sharedQuizzes = await Query.getQuizzesOfOtherUsers( /* aUserId */ req.user.id);
  res.render('user/home', {
    title: 'home page for teacher',
    myQuizzes,
    myDraftQuizzes,
    sharedQuizzes,
  });
});

/* compose quiz page for teacher */
// router.get('/home/compose', ensureAuthenticated, (req, res) =>
//   res.render('user/compose', {
//     title: 'compose for teacher',
//   })
// );

/* edit quiz page for teacher */
// router.get('/home/edit', ensureAuthenticated, (req, res) =>
//   res.render('user/edit', {
//     title: 'edit quiz for teacher',
//   })
// );
module.exports = router;
