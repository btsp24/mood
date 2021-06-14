const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

/* login page */
router.get('/login', function (req, res, next) {
    res.render('user/login', { title: 'login page for teacher' });
});

/* register page */
router.get('/register', function (req, res, next) {
    res.render('user/register', { title: 'register page for teacher' });
});

/* logout page */
router.get('/logout', function (req, res, next) {
    res.render('user/logout', { title: 'succesfully logged out' });
});

/* home page  for teacher*/
router.get('/home', function (req, res, next) {
    res.render('user/home', { title: 'home page for teacher' });
});

module.exports = router;
