const path = require('path');
const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validate: uuidValidate } = require('uuid');

// Load User model

const { User } = require('../db/models');
const { ensureAuthenticated, forwardAuthenticated } = require('./isAuth');
const { Query } = require('../utils/queries');

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
const upload = multer({ storage: storage });
router.post('/upload', upload.single('file'), function (req, res, next) {
  const img = req.file.filename;
  console.log('img :>> ', img);
  if(!req.file) {
    res.status(500).send({error: 'error occured'});
    return next(req.originalUrl);
  }
  
  console.log(req.body)
  console.log(req.files)
  console.log(req.file)
  
  // res.send('SUCCESS')
  return res.status(200).send(req.file);
  // response return edilecek
  // res.send('File uploaded successfully! -> filename = ' + req.file.filename);
  // console.log(req.file);
  // res.json({ fileUrl: 'http://192.168.0.7:3000/images/' + req.file.filename });
  
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
  const { userName, email, password, password2 } = req.body;
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
      /*       try {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            User.create({
              userName,
              email,
              password: hash,
            }).then(user => {
              req.flash('success_msg', 'You are now registered and can log in');
              res.redirect('/login');
            });
          });
        });
      } catch (err) {
        console.log('error :>> ', err);
      } */
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

router.get('/clone/:quizId', ensureAuthenticated, async (req, res) => {
  const oldQuizId = req.params.quizId;
  const userId = req.user.id;
  const datasetOld = await Query.getQuizDataset(oldQuizId);
  const newQuizId = await Query.cloneQuiz(datasetOld, userId);
  req.params.quizId = newQuizId;
  res.redirect(307, `/edit/${newQuizId}`);
});

// edit route
router.get('/edit/:quizId', ensureAuthenticated, async (req, res) => {
  let dataset;
  const quizId = req.params.quizId;
  const userId = req.user.id;
  console.log('quizId :>> ', quizId);
  console.log('userId :>> ', userId);
  console.log('isQuizEditable :>> ', await Query.isQuizEditable(quizId, userId));
  if (!!quizId && uuidValidate(quizId) && (await Query.isQuizEditable(quizId, userId))) {
    console.log('quizId  :>> ', quizId);
    dataset = await Query.getQuizDataset(quizId);
  }
  res.render('user/edit', {
    title: 'quiz editor page',
    dataset,
  });
});

router.post('/save', async (req, res) => {
  const { dataset } = req.body; // {details, rows}
  const quizId = dataset.quizId;
  try {
    await Query.updateQuizDataset(dataset, quizId);
  req.flash('success_msg', 'quiz saved');
  res.redirect('/home');
} catch (err) {
  console.log('error :>> ', err);
}
/* 
  const errors = [];

  if (!userName || !email || !password || !password2) {
    errors.push({
      msg: 'Please enter all fields',
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

      
    }
  }
   */
});

/* home page  for teacher */
router.get('/home', ensureAuthenticated, async (req, res) => {
  res.app.locals.user = req.user;
  const myQuizzes = await Query.getQuizzesOfUser(/* aUserId */ req.user.id);
  const myDraftQuizzes = await Query.getDraftQuizzesOfUser(/* aUserId */ req.user.id);
  const sharedQuizzes = await Query.getQuizzesOfOtherUsers(/* aUserId */ req.user.id);
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
