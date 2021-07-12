const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validate: uuidValidate } = require('uuid');

// Load User model

const { User } = require('../db/models');
const { ensureAuthenticated, forwardAuthenticated } = require('./isAuth');
const { Query } = require('../utils/queries');

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

router.get('/edit/:quizId', ensureAuthenticated, async (req, res) => {
  let dataset;
  // sample quizId from dummy data
  const quizId = req.params.quizId;
  const userId = req.user.id;
  if (!!quizId && uuidValidate(quizId) && (await Query.isQuizEditable(quizId, userId))) {
    console.log('quizId  :>> ', quizId);
    dataset = await Query.getQuizDataset(quizId);
  }
  console.log('dataset :>> ', dataset);
  // console.log('data :>> ', data);
  res.render('user/edit', {
    title: 'quiz editor page',
    dataset,
  });
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
