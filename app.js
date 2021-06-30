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
require('./utils/auth');
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
// hold game and player list on memory
const games = new LiveGames();
const players = new Players();

io.on('connection', socket => {
  /*
      console.log('socket.conn.id :>> ', socket.conn.id);
  console.log('req.user :>> ', app.locals.user.id);

  other methods will come here

  socket.on('UUID-request', () => {
    console.log({
      old: socket.conn.id,
      new: app.locals.user.id,
    });
    socket.conn.id = app.locals.user.id;
    socket.emit('UUID-response', app.locals.user.id);
  }); 
  */

  // host connects for the first time
  socket.on('host-join', async function (data) {
    try {
      const questions = await Query.getQuestionsOfTheQuiz(data.id);
      if (!questions) {
        // new pin for the given game
        const gamePin = Math.floor(Math.random() * 900_000) + 100_000;
        games.addGame(gamePin, socket.id, false, {
          gameid: data.id,
          questionLive: false,
          questionCount: questions.length,
          question: 1,
          playersAnswered: 0,
        });
        const game = games.getGame(socket.id);
        // host joins a pin named socket room
        socket.join(game.pin);
        socket.emit('showGamePin', { pin: game.pin });
      } else {
        socket.emit('noGameFound');
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  });

  // host connects from the game view
  socket.on('host-join-game', data => {
    const oldHostId = data.id;
    const game = games.getGame(oldHostId);
    if (game) {
      game.hostId = socket.id;
      const playerData = players.getPlayers(oldHostId);
      for (const player of players) {
        if (player.hostId === oldHostId) {
          player.hostId = socket.id;
        }
      }
      const currentQuestion = Query.getOneQuestionWithAnswers(game.gameData.gameid, game.gameData.question);
      /* GAMEQUESTION!S */
      socket.emit('gameQuestion', { ...currentQuestion, playersInGame: playerData.length });
      // ** neden farklı
      io.to(game.pin).emit('gameStartedPlayer');
      game.gameData.questionLive = true;
    } else {
      socket.emit('noGameFound');
    }
  });

  // player first time connect
  socket.on('player-join', params => {
    let gameFound = false;

    for (const game of games) {
      if (params.pin === game.pin) {
        const hostId = game.hostId;
        players.addPlayer(hostId, socket.id, params.name, {
          gameScore: 0,
          answer: 0,
        });
        socket.join(params.pin);
        const playersInGame = players.getPlayers(hostId);
        io.to(params.pin).emit('updatePlayerLobby', playersInGame);
        gameFound = true;
      }
    }
    if (!gameFound) {
      socket.emit('noGameFound');
    }
  });

  // player connects from the game view
  socket.on('player-join-game', data => {
    const player = players.getPlayer(data.id);
    if (player) {
      const game = games.getGame(player.hostId);
      socket.join(game.pin);
      player.playerId = socket.id;
      const playerData = player.getPlayers(game.hostId);
      socket.emit('playerGameData', playerData);
    } else {
      socket.emit('noGameFound');
    }
  });

  // host or player disconnects
  socket.on('disconnect', () => {
    const game = games.getGame(socket.id);
    if (game) {
      if (!game.gameLive) {
        games.removeGame(socket.id);

        // here is one of the places to store player score
        const playersToRemove = players.getPlayers(game.hostId);
        playersToRemove.forEach(exPlayer => {
          players.removePlayer(exPlayer.playerId);
        });
        io.to(game.pin).emit('hostDisconnect');
        socket.leave(game.pin);
      }
    } else {
      const player = players.getPlayer(socket.id);
      if (player) {
        const hostId = player.hostId;
        const game = games.getGame(hostId);
        const pin = game.pin;
        if (!game.gameLive) {
          players.removePlayer(socket.id);
          const playersInGame = players.getPlayers(hostId);
          io.to(pin).emit('updatePlayerLobby', playersInGame);
          socket.leave(pin);
        }
      }
    }
  });
  /* 
  socket.on('quizList-request', async function () {
    const quizzes = await Query.getQuizzesOfTheUser(app.locals.user.id);

    socket.emit('quizList-response', quizzes);
  });
  */
});
