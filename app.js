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

const { v4: uuidv4 } = require('uuid');

// Uri Routers
require('./auth');
const userRouter = require('./routes/user.routes');
const hostRouter = require('./routes/host.routes');
const playerRouter = require('./routes/player.routes');

//Import classes
const { LiveGames } = require('./utils/liveGames');
const { Players } = require('./utils/players');
const { Query } = require('./utils/queries');

const app = express();

// share public dir
app.use(express.static(path.join(__dirname, 'public')));
// cookie setup
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

// session cookie
app.use(
  session({
    secret: '03b6e63a-d07b-4479-8982-aa88ccd94810',
    resave: true,
    saveUninitialized: true,
  })
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// bind logger
app.use(logger('dev'));

// bind socketio
const server = http.createServer(app);
const io = socketIO(server);

io.engine.generateId = async req => {
  return await uuidv4();
};

// Connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// bind uri routers
app.use('/', userRouter);
app.use('/host', hostRouter);
app.use('/', playerRouter);

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
Query.connectToDatabase();

const port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log(`http://localhost:${port}`);
});

io.on('connection', socket => {
  // console.log('socket.conn.id :>> ', socket.conn.id);
  // console.log('req.user :>> ', app.locals.user.id);

  // other methods will come here

  // socket.on('UUID-request', () => {
  //   console.log({
  //     old: socket.conn.id,
  //     new: app.locals.user.id,
  //   });
  //   socket.conn.id = app.locals.user.id;
  //   socket.emit('UUID-response', app.locals.user.id);
  // });

  socket.on('quizList-request', async function () {
    const quizzes = await Query.getQuizzesOfTheUser(app.locals.user.id);

    socket.emit('quizList-response', quizzes);
  });
});
