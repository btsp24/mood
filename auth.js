const passport = require('passport');
const LocalStrategy = require('passport-local');
const bCrypt = require('bcryptjs');
const { User } = require('./db/models');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      const isValidPassword = function (userpass, password) {
        return bCrypt.compareSync(password, userpass);
      };
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: 'User not Found' });
        }
        const validate = isValidPassword(user.password, password);
        // console.log(user, '**************');
        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Successfully logged In' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({ where: { id } }).then(function (user) {
    if (user) {
      done(null, user.get());
    } else {
      done(user.errors, null);
    }
  });
});
