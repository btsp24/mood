const debug = require('debug')('mood:server');
const createError = require('http-errors');
const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const flash = require('connect-flash');

const socketIO = require('socket.io');
const passport = require('passport');
const { sequelize } = require('./db/models');

// Uri Routers
require('./auth');
const userRouter = require('./routes/user.routes');
const hostRouter = require('./routes/host.routes');
const playerRouter = require('./routes/player.routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// bind logger
app.use(logger('dev'));

// bind socketio
const server = http.createServer(app);
const io = socketIO(server);

// cookie setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// share public dir
app.use(express.static(path.join(__dirname, 'public')));

// bind uri routers
app.use('/', userRouter);
app.use('/host', hostRouter);
app.use('/', playerRouter);

// session cookie
app.use(
  session({
    secret: '03b6e63a-d07b-4479-8982-aa88ccd94810',
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// connect db
async function connectToDatabase() {
  await sequelize.authenticate();
}
connectToDatabase();

const port = process.env.PORT || 3000;

server.listen(port, function () {
  debug(`http://localhost:${port}`);
});
