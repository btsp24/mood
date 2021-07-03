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

const { v4: uuidv4 } = require('uuid');

// Uri Routers
require('./routes/auth');
const userRouter = require('./routes/user.routes');
const hostRouter = require('./routes/host.routes');
const playerRouter = require('./routes/player.routes');

// Import classes
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
  console.log('client connected socket.id :>>', socket.id);
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
    console.log('host-join with data :>>', data);
    try {
      if (!data) {
        socket.emit('noGameFound');
      } else {
        const questions = await Query.getQuestionsOfTheQuiz(data.id);
        console.log('questions :>> ', questions);
        if (!questions) {
          // new pin for the given game
          const gamePin = Math.floor(Math.random() * 900_000) + 100_000;
          games.addGame(gamePin, socket.id, false, {
            gameId: await uuidv4(),
            quizId: data.id,
            questionLive: false,
            questionCount: questions.length,
            questionNumber: 1,
            playersAnswered: 0,
          });
          const game = games.getGame(socket.id);
          console.log('recently added game :>> ', game);
          // host joins a pin named socket room
          socket.join(game.pin);
          socket.emit('showGamePin', {
            pin: game.pin,
          });
        } else {
          socket.emit('noGameFound');
        }
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  });

  // host connects from the game view
  socket.on('host-join-game', data => {
    console.log('host-join-game with data :>>', data);
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
      const currentQuestion = Query.getOneQuestionWithAnswers(game.values.quizId, game.values.questionNumber);
      console.log('currentQuestion :>> ', currentQuestion);
      /* GAMEQUESTION!S */
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: playerData.length,
      });
      /*
      ** neden farklı
      io.to(game.pin).emit('gameStartedPlayer');
      */
      if (game.pin) {
        io.emit('gameStartedPlayer');
      }
      game.values.questionLive = true;
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
          questionScore: 0,
          answerId: null,
          gameScore: 0,
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
      socket.emit('playervalues', playerData);
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

  // set player data from given answer
  socket.on('playerAnswer', async givenAnswer => {
    const player = players.getPlayer(socket.id);
    const hostId = player.hostId;
    console.log('player :>> ', player);
    console.log('givenAnswer :>> ', givenAnswer);
    const playerCount = players.getPlayers(hostId).length;
    const game = games.getGame(hostId);
    if (game.values.questionLive) {
      player.values.answerId = givenAnswer;
      game.values.playersAnswered += 1;
      const answersOfQuestion = await Query.getAnswersOfAQuestion(
        game.values.gameId,
        game.values.questionNumber
      );
      const correctAnswer = answersOfQuestion.filter(a => {
        return a.isCorrect === true;
      });
      if (givenAnswer === correctAnswer) {
        player.values.questionScore += 100;
        io.to(game.pin).emit('getTime', socket.id);
        socket.emit('answerResult', true);
      }
      if (game.values.playersAnswered === playerCount) {
        game.values.questionLive = false;
        const playerData = players.getPlayers(game.hostId);
        io.to(game.pin).emit('questionOver', playerData, correctAnswer);
      }
    }
  });

  socket.on('getScore', async () => {
    const player = players.getPlayer(socket.id);
    player.values.quizScore += player.values.questionScore;
    const hostId = player.hostId;
    const gameId = games.getGame(hostId).values.gameId;
    const questionId = await Query.getOneQuestion(gameId, player.values.questionNumber).id;

    await Query.savePlayerQuestionScore(
      socket.id,
      gameId,
      questionId,
      player.values.answerId,
      player.values.questionScore
    );
    player.values.questionScore = 0;
  });

  socket.on('quizList-request', async function () {
    const aUserId = 'e87dd769-b724-4117-9838-0e9fe42951e7';
    const quizzes = await Query.getQuizzesOfTheUser(aUserId /* app.locals.user.id */);

    socket.emit('quizList-response', quizzes);
  });
});
