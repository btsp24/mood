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
const { Console } = require('console');

io.on('connection', socket => {
  //console.log('socket@connection#107 :>> ', socket);
  const cookies = cookie.parse(socket.request.headers.cookie || '');
  console.log('client connected socket.conn.id :>>', socket.conn.id);

  //console.log('socket.conn.id :>> ', socket.conn.id);
  if (!app.locals.user) {
    socket.emit('redirect', '/login');
  }

  // host connects for the first time
  socket.on('host-join', async hjData => {
    //console.log('host-join with data#130 :>>', hjData);
    try {
      if (!hjData) {
        socket.emit('noGameFound');
      } else {
        const questions = await Query.getQuestionsOfQuiz(hjData);
        //console.log('questions :>> ', questions);
        if (questions) {
          // new pin for the given game
          const gamePin = Math.floor(Math.random() * 90000) + 10000;
          //console.log("000000000000000000000",gamePin)
          games.addGame(gamePin, socket.conn.id, false, {
            gameId: await uuidv4(),
            quizId: hjData,
            questionLive: false,
            questionCount: questions.count,
            questionNumber: 1,
            playersAnswered: 0,
          });
          const game = games.getGame(socket.conn.id);
          //console.log('recently added game#149 :>> ', game);
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
    const oldHostId = hjgData.id;
    const game = games.getGame(oldHostId);

    if (game) {
      game.hostId = socket.conn.id;
      const playerList = players.getPlayers(oldHostId);
      console.log('playerList#172 :>> ', playerList);
      for (const player of players.players) {
        // update player hostId in playerslist with new socket.conn.id
        if (player.hostId === oldHostId) {
          player.hostId = socket.conn.id;
        }
      }

      const currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        game.values.quizId.id,
        game.values.questionNumber
      );
      //console.log('currentQuestion#180 :>> ', currentQuestion);
      /* GAMEQUESTION!S */
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.count(),
      });

      if (game.pin) {
        io.emit('gameStartedPlayer', socket.conn.id);
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
      if (pjData.pin === game.pin.toString()) {
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
          io.emit('updatePlayerLobby', playersInGame);
        }
        //io.to(pjData.pin).emit('updatePlayerLobby', playersInGame);
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
      const playerList = players.getPlayers(game.hostId);

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
        if(game.pin){
          io.emit('hostDisconnect');
        }
        
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
      player.values.answerSelected = givenAnswer;
      theGame.values.playersAnswered += 1;
      console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXxccccc', theGame.values.quizId.id);
      const answersOfQuestion = await Query.getQuestionOfQuizByQNumberWithAnswers(
        theGame.values.quizId.id,
        theGame.values.questionNumber
      );

      const correctAnswers = answersOfQuestion.Answers.filter(a => {
        return a.isCorrect === 1;
      });

      correctAnswers.forEach(answer => {
        if (givenAnswer === answer.answerOrder) {
          player.values.questionScore += 100;
          player.values.correctAnswerCount += 1;
          if (theGame.pin) {
            io.emit('getTime', socket.conn.id);
          }
          //io.to(theGame.pin).emit('getTime', socket.conn.id);
          socket.emit('answerResult', true);
        }
      });
      if (theGame.values.playersAnswered === players.count()) {
        theGame.values.questionLive = false;
        const playerData = players.getPlayers(theGame.hostId.id);
        if (theGame.pin) {
          io.emit('questionOver', playerData, correctAnswers);
        }
      } else {
        console.log('updatePlayersAnswered#296 :>> ', {
          playersInGame: players.count(),
          playersAnswered: theGame.values.playersAnswered,
        });
        if (theGame.pin) {
          io.emit('updatePlayersAnswered', {
            playersInGame: players.count(),
            playersAnswered: theGame.values.playersAnswered,
          });
        }
      }
    }
  });

  socket.on('getScore', async () => {
    const player = players.getPlayer(socket.conn.id);
    player.values.quizScore += player.values.questionScore;
    const hostId = player.hostId;
    const game = games.getGame(hostId);
    //console.log("üüüüüüüüüüüüüüüüüüüüü", game, player, socket.conn.id, players);
    const quizId = game.values.quizId;
    const questionNumber = game.values.questionNumber;
    //console.log("LLLLLLLLLLLLLLLLLLLLLLLLLL",quizId,questionNumber)
    const questionId = await Query.getQuestionOfQuizByQNumber(quizId.id, questionNumber);
    //const gameId = games.getGame(hostId);

    await Query.savePlayerQuestionScore(
      socket.conn.id,
      game.values.gameId,
      questionId.id,
      player.values.answerSelected,
      player.values.questionScore
    );
    socket.emit('newScore', player.values.questionScore);
    player.values.questionScore = 0;
  });

  socket.on('time', timingData => {
    const timeScore = timingData.time * 5;
    console.log(timingData);
    const player = players.getPlayer(timingData.player);
    console.log('OOOOOOOOOOOOOOOOOOOO', player);
    player.values.questionScore += timeScore;
  });

  socket.on('timeUp', async () => {
    console.log('------TIMEUP-------');
    const theGame = games.getGame(socket.conn.id);
    theGame.values.questionLive = false;

    const playerList = players.getPlayers(theGame.hostId);
    const answersOfQuestion = await Query.getQuestionOfQuizByQNumberWithAnswers(
      theGame.values.quizId.id,
      theGame.values.questionNumber
    );
    const correctAnswers = answersOfQuestion.Answers.filter(a => {
      return a.isCorrect === 1;
    });
    const playerData = players.getPlayers(theGame.hostId);

    if (theGame.pin) {
      console.log('888888888888888888888888', players, theGame, theGame.hostId, playerData, correctAnswers);
      io.emit('questionOver', playerData, correctAnswers);
    }
  });

  socket.on('nextQuestion', async (count) => {
    //const playerList = players.getPlayers(socket.conn.id);
    for (const player of players.players) {
      if (player.hostId === socket.conn.id) {
        player.values.answerId = null;
      }
    }
    let currentQuestion;
    const theGame = games.getGame(socket.conn.id);

    theGame.values.playersAnswered = 0;
    theGame.values.questionLive = true;
    theGame.values.questionNumber += 1;
    if (theGame.values.questionNumber <= theGame.values.questionCount) {
      currentQuestion = await Query.getAnswersOfQuestionByQuizIdAndQNumber(
        theGame.values.quizId.id,
        theGame.values.questionNumber
      );
      console.log('currentQuestion#354 :>> ', currentQuestion);
      socket.emit('gameQuestion', {
        ...currentQuestion,
        playersInGame: players.count(),
      });
    } else {
      const playerList = players.getPlayers(theGame.hostId);
      console.log('////////////////////', playerList, theGame, theGame.hostId);
      playerList.sort((a, b) => {
        // sort descending
        return -(a.values.gameScore - b.values.gameScore);
      });
      const topFivePlayers = [];
      for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i];
        console.log('////////////////////', player);
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
      console.log(',,,,,,,,,,,,,,,,,,,,,,,,,,,,', topFivePlayers);
      // check the counter implementation
      if (theGame.pin) {
        io.emit('GameOver', topFivePlayers);
      }
    }
    if (theGame.pin) {
      if(!!currentQuestion){
        
        io.emit('nextQuestionPlayer',currentQuestion.question.numberOfChoices);
      }
     
      // io.emit('nextQuestionPlayer');
    }
  });

  socket.on("podium",async()=>{
    
    for (const player of players.players) {
      if (player.hostId === socket.conn.id) {
        player.values.answerId = null;
      }
    }
    const theGame = games.getGame(socket.conn.id);
    theGame.values.playersAnswered = 0;
    theGame.values.questionLive = true;
    theGame.values.questionNumber += 1;
    if (theGame.values.questionNumber <= theGame.values.questionCount) {
      const currentQuestion =
        await Query.getAnswersOfQuestionByQuizIdAndQNumber(
          theGame.values.quizId.id,
          theGame.values.questionNumber
        );
      console.log("currentQuestion#354 :>> ", currentQuestion);
      socket.emit("gameQuestion", {
        ...currentQuestion,
        playersInGame: players.count(),
      });
    } else {
      const playerList = players.getPlayers(theGame.hostId);
      console.log("////////////////////",playerList,theGame,theGame.hostId)
      playerList.sort((a, b) => {
        // sort descending
        return -(a.values.gameScore - b.values.gameScore);
      });
      const topFivePlayers = [];
      for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i];
        console.log("////////////////////",player)
        const aPlayerRecord = {
          pos: i + 1,
          name: player.name,
          gameScore: player.values.gameScore,
          correctAnswerCount: player.values.correctAnswerCount,
          questionCount: theGame.values.questionCount,
        };
        console.log("aPlayerRecord#375 :>> ", aPlayerRecord);
        topFivePlayers.push(aPlayerRecord);
      }

    console.log("****top5",topFivePlayers)
      io.emit("podiumtake", topFivePlayers);

    
  }})


  // when host starts the game
  socket.on('startGame', () => {
    console.log('oyun basladı!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
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
