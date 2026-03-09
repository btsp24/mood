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
const sharedsession = require('express-socket.io-session');

const { v4: uuidv4 } = require('uuid');

// Uri Routers
require('./routes/auth');
const userRouter = require('./routes/user.routes');
const hostRouter = require('./routes/host.routes');
const playerRouter = require('./routes/player.routes');

// Import classes
const { LiveGames } = require(path.join(__dirname, 'utils/liveGames'));
const { Players } = require(path.join(__dirname, 'utils/players'));
const { Query } = require(path.join(__dirname, 'utils/queries'));

const app = express();
// share public dir
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
// cookie setup
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

// session cookie
const sessionMiddleware = session({
  secret: '03b6e63a-d07b-4479-8982-aa88ccd94810',
  resave: true,
  saveUninitialized: true,
});
app.use(sessionMiddleware);

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
  return uuidv4();
};

// Share session with socket.io
io.use(sharedsession(sessionMiddleware, {
  autoSave: true,
}));

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

io.on('connection', socket => {
  const playerScoreList = [];

  // Get user ID from shared session (for hosts/teachers)
  const sessionUser = socket.handshake.session && socket.handshake.session.passport
    ? socket.handshake.session.passport.user
    : null;

  if (!sessionUser && !app.locals.user) {
    socket.emit('redirect', '/login');
  }

  // host connects for the first time
  socket.on('host-join', async hjData => {

    try {
      if (!hjData) {
        socket.emit('noGameFound');
      } else {
        const hjDataQuizId = hjData.id;
        const questions = await Query.getQuestionsOfQuiz(hjDataQuizId);

        if (questions) {
          // new pin for the given game
          const gamePin = Math.floor(Math.random() * 90000) + 10000;
          games.addGame(gamePin, socket.conn.id, false, {
            gameId: uuidv4(),
            quizId: hjDataQuizId,
            userId: sessionUser, // store actual user ID for DB operations
            questionLive: false,
            questionCount: questions.count,
            questionNumber: 1,
            playersAnswered: 0,
          });
          const game = games.getGame(socket.conn.id);

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
      console.log('error host-join :>> ', error);
    }
  });

  // host connects from the game view
  socket.on('host-join-game', async hjgData => {
    const oldHostId = hjgData.id;
    const game = games.getGame(oldHostId);

    if (game) {
      game.hostId = socket.conn.id;
      const playerList = players.getPlayers(oldHostId);

      // update player hostId in playerslist with new socket.conn.id
      for (const player of players.players) {
        if (player.hostId === oldHostId) {
          player.hostId = socket.conn.id;
        }
      }

      const currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        game.values.quizId,
        game.values.questionNumber
      );

      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.getPlayers(socket.conn.id).length,
      });

      if (game.pin) {
        io.to(game.pin).emit('gameStartedPlayer', currentQuestion.question.numberOfChoices);
      }
      game.values.questionLive = true;
    } else {
      socket.emit('noGameFound');
    }
  });

  // player first time connect
  socket.on('player-join', pjData => {
    let gameFound = false;

    for (const game of games.games) {
      if (pjData.pin == game.pin) {
        const hostId = game.hostId;
        if (pjData.name != undefined) {
          players.addPlayer(hostId, socket.conn.id, pjData.name, {
            questionScore: 0,
            correctAnswerCount: 0,
            answerSelected: null,
            gameScore: 0,
          });
        }

        socket.join(pjData.pin);
        const playersInGame = players.getPlayers(hostId);

        if (pjData.pin) {
          io.to(pjData.pin).emit('updatePlayerLobby', playersInGame);
        }
        gameFound = true;
      }
    }
    if (!gameFound) {
      socket.emit('noGameFound');
    }
  });

  // player connects from the game view
  socket.on('player-join-game', pjgData => {
    const player = players.getPlayer(pjgData.id);

    if (player) {
      const game = games.getGame(player.hostId);
      socket.join(game.pin);
      player.playerId = socket.conn.id;
      const playerList = players.getPlayers(game.hostId);

      socket.emit('playerValues', playerList);
    } else {
      socket.emit('noGameFound');
    }
  });

  // host or player disconnects
  socket.on('disconnect', () => {
    const game = games.getGame(socket.conn.id);
    if (game) {
      if (!game.gameLive) {
        games.removeGame(socket.conn.id);

        const playersToRemove = players.getPlayers(game.hostId);
        playersToRemove.forEach(exPlayer => {
          players.removePlayer(exPlayer.playerId);
        });
        if (game.pin) {
          io.to(game.pin).emit('hostDisconnect');
        }

        socket.leave(game.pin);
      }
    } else {
      const player = players.getPlayer(socket.conn.id);
      if (player) {
        const hostId = player.hostId;
        const pGame = games.getGame(hostId);
        if (pGame) {
          const pin = pGame.pin;
          if (!pGame.gameLive) {
            players.removePlayer(socket.conn.id);
            const playersInGame = players.getPlayers(hostId);
            io.to(pin).emit('updatePlayerLobby', playersInGame);
            socket.leave(pin);
          }
        }
      }
    }
  });

  // set player data from given answer
  socket.on('playerAnswer', async givenAnswer => {
    const player = players.getPlayer(socket.conn.id);
    if (!player) return;

    const hostId = player.hostId;
    const theGame = games.getGame(hostId);
    if (!theGame) return;

    if (theGame.values.questionLive) {
      player.values.answerSelected = givenAnswer;
      theGame.values.playersAnswered += 1;

      const answersOfQuestion = await Query.getQuestionOfQuizByQNumberWithAnswers(
        theGame.values.quizId,
        theGame.values.questionNumber
      );

      const correctAnswers = answersOfQuestion.Answers.filter(a => {
        return a.isCorrect;
      });

      correctAnswers.forEach(answer => {
        if (givenAnswer === answer.answerOrder) {
          player.values.questionScore += 100;
          player.values.correctAnswerCount += 1;
          if (theGame.pin) {
            io.to(theGame.pin).emit('getTime', socket.conn.id);
          }
          socket.emit('answerResult', true);
        }
      });

      const playersInGame = players.getPlayers(theGame.hostId).length;
      if (theGame.values.playersAnswered >= playersInGame) {
        theGame.values.questionLive = false;
        const playerData = players.getPlayers(theGame.hostId);
        if (theGame.pin) {
          io.to(theGame.pin).emit('questionOver', playerData, correctAnswers);
        }
      } else {
        if (theGame.pin) {
          io.to(theGame.pin).emit('updatePlayersAnswered', {
            playersInGame: playersInGame,
            playersAnswered: theGame.values.playersAnswered,
          });
        }
      }
    }
  });

  socket.on('getScore', async () => {
    const player = players.getPlayer(socket.conn.id);
    if (!player) return;

    player.values.gameScore += player.values.questionScore;
    const hostId = player.hostId;
    const game = games.getGame(hostId);
    if (!game) return;

    const quizId = game.values.quizId;
    const questionNumber = game.values.questionNumber;
    const question = await Query.getQuestionOfQuizByQNumber(quizId, questionNumber);

    // Save game record using actual user ID from session
    const userId = game.values.userId;
    await Query.saveGame(game.values.gameId, quizId, userId, game.pin);

    if (question) {
      await Query.savePlayerQuestionScore(
        socket.conn.id,
        question.id,
        player.values.answerSelected,
        player.values.questionScore
      );
    }
    await Query.savePlayerGameScore(socket.conn.id, player.name, game.values.gameId, player.values.gameScore);
    socket.emit('newScore', player.values.questionScore);
    player.values.questionScore = 0;
  });

  socket.on('time', timingData => {
    const timeScore = timingData.time * 5;
    const player = players.getPlayer(timingData.player);
    if (player) {
      player.values.questionScore += timeScore;
    }
  });

  socket.on('timeUp', async () => {
    // timeUp is emitted by the host, so socket.conn.id IS the host
    const theGame = games.getGame(socket.conn.id);
    if (!theGame) return;

    theGame.values.questionLive = false;

    const answersOfQuestion = await Query.getQuestionOfQuizByQNumberWithAnswers(
      theGame.values.quizId,
      theGame.values.questionNumber
    );
    const correctAnswers = answersOfQuestion.Answers.filter(a => {
      return a.isCorrect;
    });
    const playerData = players.getPlayers(theGame.hostId);

    if (theGame.pin) {
      io.to(theGame.pin).emit('questionOver', playerData, correctAnswers);
    }
  });

  socket.on('nextQuestion', async (count) => {
    for (const player of players.players) {
      if (player.hostId === socket.conn.id) {
        player.values.answerId = null;
      }
    }
    let currentQuestion;
    const theGame = games.getGame(socket.conn.id);
    if (!theGame) return;

    theGame.values.playersAnswered = 0;
    theGame.values.questionLive = true;
    theGame.values.questionNumber += 1;
    if (theGame.values.questionNumber <= theGame.values.questionCount) {
      currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        theGame.values.quizId,
        theGame.values.questionNumber
      );
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.getPlayers(theGame.hostId).length,
      });
    } else {
      const playerList = players.getPlayers(theGame.hostId);
      playerList.sort((a, b) => {
        // sort descending
        return -(a.values.gameScore - b.values.gameScore);
      });
      const len = playerList.length;
      for (let i = 0; i < len; i++) {
        const player = playerList[i];
        const aPlayerRecord = {
          pos: i + 1,
          name: player.name,
          gameScore: player.values.gameScore,
          correctAnswerCount: player.values.correctAnswerCount,
          questionCount: theGame.values.questionCount,
        };
        playerScoreList.push(aPlayerRecord);
      }
      if (theGame.pin) {
        io.to(theGame.pin).emit('GameOver', playerScoreList);
      }
    }

    if (theGame.pin) {
      if (currentQuestion) {
        io.to(theGame.pin).emit('nextQuestionPlayer', currentQuestion.question.numberOfChoices);
      }
    }
  });

  socket.on('getTopFive', () => {
    socket.emit('TopFivePlayer', playerScoreList);
  });

  socket.on("podium", async () => {
    socket.emit('podiumtake', playerScoreList);
  });

  // when host starts the game
  socket.on('startGame', () => {
    const game = games.getGame(socket.conn.id);
    if (!game) return;
    game.gameLive = true;
    socket.emit('gameStarted', game.hostId);
  });
});
