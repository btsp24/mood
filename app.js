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
app.locals.moment = require('moment');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// bind logger
app.use(logger('dev'));

// bind socketio
const server = http.createServer(app);
const io = socketIO(server);

io.engine.generateId = async req => {
  const newUUID = uuidv4();
  return newUUID;
};

// Connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// bind uri routers
app.use('/', userRouter);
app.use('/', hostRouter);
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

const cookie = require('cookie');

io.on('connection', socket => {
  console.log('socket@connection#107 :>> ', socket);
  const cookies = cookie.parse(socket.request.headers.cookie || '');
  // console.log('client connected socket.conn.id :>>', cookies);

  console.log('socket.conn.id :>> ', socket.conn.id);
  if (!app.locals.user) {
    socket.emit('redirect', '/login');
  }

  // host connects for the first time
  socket.on('host-join', async hjData => {
    console.log('host-join with data#130 :>>', hjData);
    try {
      if (!hjData) {
        socket.emit('noGameFound');
      } else {
        const questions = await Query.getQuestionsOfQuiz(hjData);
        console.log('questions :>> ', questions);
        if (!questions) {
          // new pin for the given game
          const gamePin = Math.floor(Math.random() * 900_000) + 100_000;
          games.addGame(gamePin, socket.conn.id, false, {
            gameId: uuidv4(),
            quizId: hjData,
            questionLive: false,
            questionCount: questions.count,
            questionNumber: 1,
            playersAnswered: 0,
          });
          const game = games.getGame(socket.conn.id);
          console.log('recently added game#149 :>> ', game);
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
      console.log('error #160:>> ', error);
    }
  });

  // host connects from the game view
  socket.on('host-join-game', async hjgData => {
    console.log('host-join-game with data#166 :>>', hjgData);
    const oldHostId = hjgData;
    const game = games.getGame(oldHostId);
    if (game) {
      game.hostId = socket.conn.id;
      const playerList = players.getPlayers(oldHostId);
      console.log('playerList#172 :>> ', playerList);
      for (const player of players) {
        // update player hostId in playerslist with new socket.conn.id
        if (player.hostId === oldHostId) {
          player.hostId = socket.conn.id;
        }
      }
      const currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        game.values.quizId,
        game.values.questionNumber
      );
      console.log('currentQuestion#180 :>> ', currentQuestion);
      /* GAMEQUESTION!S */
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.count(),
      });

      if (game.pin) {
        io.emit('gameStartedPlayer');
      }
      game.values.questionLive = true;
    } else {
      socket.emit('noGameFound');
    }
  });

  // player first time connect
  socket.on('player-join', pjData => {
    let gameFound = false;

    for (const game of games) {
      if (pjData.pin === game.pin) {
        const hostId = game.hostId;
        players.addPlayer(hostId, socket.conn.id, pjData.name, {
          questionScore: 0,
          correctAnswerCount: 0,
          answerId: null,
          gameScore: 0,
        });
        socket.join(pjData.pin);
        const playersInGame = players.getPlayers(hostId);
        io.to(pjData.pin).emit('updatePlayerLobby', playersInGame);
        gameFound = true;
      }
    }
    if (!gameFound) {
      socket.emit('noGameFound');
    }
  });

  // player connects from the game view
  socket.on('player-join-game', pjgData => {
    console.log('pjgData#221 :>> ', pjgData);
    const player = players.getPlayer(pjgData.id);
    if (player) {
      const game = games.getGame(player.hostId);
      socket.join(game.pin);
      player.playerId = socket.conn.id;
      const playerList = player.getPlayers(game.hostId);
      socket.emit('playerValues', playerList);
    } else {
      socket.emit('noGameFound');
    }
  });

  // host or player disconnects
  socket.on('disconnect', () => {
    const game = games.getGame(socket.conn.id);
    console.log('game#237 :>> ', game);
    if (game) {
      if (!game.gameLive) {
        games.removeGame(socket.conn.id);

        // here is one of the places to store player score
        const playersToRemove = players.getPlayers(game.hostId);
        playersToRemove.forEach(exPlayer => {
          players.removePlayer(exPlayer.playerId);
        });
        io.to(game.pin).emit('hostDisconnect');
        socket.leave(game.pin);
      }
    } else {
      const player = players.getPlayer(socket.conn.id);
      if (player) {
        const hostId = player.hostId;
        const pGame = games.getGame(hostId);
        const pin = pGame.pin;
        if (!pGame.gameLive) {
          players.removePlayer(socket.conn.id);
          const playersInGame = players.getPlayers(hostId);
          io.to(pin).emit('updatePlayerLobby', playersInGame);
          socket.leave(pin);
        }
      }
    }
  });

  // set player data from given answer
  socket.on('playerAnswer', async givenAnswer => {
    const player = players.getPlayer(socket.conn.id);
    const hostId = player.hostId;
    console.log('player#270 :>> ', player);
    console.log('givenAnswer#271 :>> ', givenAnswer);
    const theGame = games.getGame(hostId);
    if (theGame.values.questionLive) {
      player.values.answerId = givenAnswer;
      theGame.values.playersAnswered += 1;
      const answersOfQuestion = await Query.getAnswersOfQuestion(
        theGame.values.quizId,
        theGame.values.questionNumber
      );
      const correctAnswers = answersOfQuestion.filter(a => {
        return a.isCorrect === true;
      });
      correctAnswers.forEach(answer => {
        if (givenAnswer === answer.id) {
          player.values.questionScore += 100;
          player.values.correctAnswerCount += 1;
          io.to(theGame.pin).emit('getTime', socket.conn.id);
          socket.emit('answerResult', true);
        }
      });
      if (theGame.values.playersAnswered === players.count()) {
        theGame.values.questionLive = false;
        const playerData = players.getPlayers(theGame.hostId);
        io.to(theGame.pin).emit('questionOver', playerData, correctAnswers);
      } else {
        console.log('updatePlayersAnswered#296 :>> ', {
          playersInGame: players.count(),
          playersAnswered: theGame.values.playersAnswered,
        });
        io.to(theGame.pin).emit('updatePlayersAnswered', {
          playersInGame: players.count(),
          playersAnswered: theGame.values.playersAnswered,
        });
      }
    }
  });

  socket.on('getScore', async () => {
    const player = players.getPlayer(socket.conn.id);
    player.values.quizScore += player.values.questionScore;
    const hostId = player.hostId;
    const game = games.getGame(hostId);
    const quizId = game.values.quizId;
    const questionNumber = game.values.questionNumber;
    const questionId = await Query.getOneQuestion(quizId, questionNumber).id;

    await Query.savePlayerQuestionScore(
      socket.conn.id,
      game.values.gameId,
      questionId,
      player.values.answerId,
      player.values.questionScore
    );
    socket.emit('newScore', player.values.questionScore);
    player.values.questionScore = 0;
  });

  socket.on('time', timingData => {
    const timeScore = timingData.time * 5;
    const player = players.getPlayer(timingData.player);
    player.values.questionScore += timeScore;
  });

  socket.on('timeUp', async () => {
    const theGame = games.getGame(socket.conn.id);
    theGame.values.questionLive = false;
    const playerList = players.getPlayers(theGame.hostId);
    const answersOfQuestion = await Query.getAnswersOfQuestion(
      theGame.values.quizId,
      theGame.values.questionNumber
    );
    const correctAnswers = answersOfQuestion.filter(a => {
      return a.isCorrect === true;
    });
    const playerData = players.getPlayers(theGame.hostId);
    io.to(theGame.pin).emit('questionOver', playerData, correctAnswers);
  });

  socket.on('nextQuestion', async () => {
    const playerList = players.getPlayers(socket.conn.id);
    for (const player of players) {
      if (player.hostId === socket.conn.id) {
        player.values.answerId = null;
      }
    }
    const theGame = games.getGame(socket.conn.id);
    theGame.values.playersAnswered = 0;
    theGame.values.questionLive = true;
    theGame.values.questionNumber += 1;
    if (theGame.values.questionNumber <= theGame.values.questionCount) {
      const currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        theGame.values.quizId,
        theGame.values.questionNumber
      );
      console.log('currentQuestion#354 :>> ', currentQuestion);
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.count(),
      });
    } else {
      const playerList = players.getPlayers(theGame.hostId);
      playerList.sort((a, b) => {
        // sort descending
        return -(a.values.gameScore - b.values.gameScore);
      });
      const topFivePlayers = [];
      for (let i = 0; i < 5; i++) {
        const player = playerList[i];
        const aPlayerRecord = {
          pos: i + 1,
          name: player.name,
          gameScore: player.values.gameScore,
          correctAnswerCount: player.values.correctAnswerCount,
          questionCount: theGame.values.questionCount,
        };
        console.log('aPlayerRecord#375 :>> ', aPlayerRecord);
        topFivePlayers.push(aPlayerRecord);
      }
      // check the counter implementation
      io.to(game.pin).emit('GameOver', topFivePlayers);
    }
    if (game.pin) {
      io.to(game.pin).emit('nextQuestionPlayer');
      // io.emit('nextQuestionPlayer');
    }
  });

  // when host starts the game
  socket.on('startGame', () => {
    const game = games.getGame(socket.conn.id);
    game.gameLive = true;
    socket.emit('gameStarted', game.hostId);
  });
});

// after connection section
// console.log('req.user :>> ', app.locals.user.id);

// other methods will come here

// socket.on('UUID-request', () => {
//   console.log('s: UUID', {
//     old: socket.conn.id,
//     new: app.locals.user.id,
//   });
//   socket.conn.id = app.locals.user.id;
//   socket.emit('UUID-response', app.locals.user.id);
// });

// socket.on('quizList-request', async function () {
//   /* const aUserId = 'e87dd769-b724-4117-9838-0e9fe42951e7'; */
//   const quizData = await Query.getQuizzesOfUser(/* aUserId */ app.locals.user.id);

//   socket.emit('quizList-response', quizData);
// });
// socket.on('draft-quizList-request', async function () {
//   /* const aUserId = 'e87dd769-b724-4117-9838-0e9fe42951e7'; */
//   const quizData = await Query.getDraftQuizzesOfUser(/* aUserId */ app.locals.user.id);

//   socket.emit('draft-quizList-response', quizData);
// });
// socket.on('shared-quizList-request', async function () {
//   /* const aUserId = 'e87dd769-b724-4117-9838-0e9fe42951e7'; */
//   const quizData = await Query.getQuizzesOfOtherUsers(/* aUserId */ app.locals.user.id);

//   socket.emit('shared-quizList-response', quizData);
// });
