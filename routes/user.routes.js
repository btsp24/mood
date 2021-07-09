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

router.get(
  '/z/:quizId',
  /* ensureAuthenticated, */ async (req, res) => {
    let data;
    // sample quizId from dummy data
    const quizId = req.params.quizId || '20434cf9-331a-4932-af41-d24b5b5175d4';
    const userId = !!req.user
      ? req.user.id || '394d6af2-e6bd-4e55-a278-d7e1c59269bb'
      : '394d6af2-e6bd-4e55-a278-d7e1c59269bb';
    if (!!quizId && uuidValidate(quizId) && (await Query.isQuizEditable(quizId, userId))) {
      console.log('quizId  :>> ', quizId);
      data = await Query.getQuestionsWithAnswers(quizId, false);
    }
    // console.log('data :>> ', data);
    res.render('user/z', {
      title: 'z quiz composer page',
      data,
    });
  }
);
/* home page  for teacher */
router.get('/home', ensureAuthenticated, (req, res) => {
  res.app.locals.user = req.user;
  res.render('user/home', {
    title: 'home page for teacher',
  });
});

/* compose quiz page for teacher */
router.get('/home/compose', ensureAuthenticated, (req, res) =>
  res.render('user/compose', {
    title: 'compose for teacher',
  })
);

/* edit quiz page for teacher */
router.get('/home/edit', ensureAuthenticated, (req, res) =>
  res.render('user/edit', {
    title: 'edit quiz for teacher',
  })
);
module.exports = router;
