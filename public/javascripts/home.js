console.log('from :>> ', '🏡');
const socket = io();
const quizList = [];

socket.on('connect', () => {
  // console.log('connected :>> ', socket.io.engine.id);

  // set socketid to actual userid for host
  // socket.emit('UUID-request');

  // socket.on('UUID-response', newUUID => {
  //   console.log({ old: socket.io.engine.id, new: newUUID });
  //   socket.io.engine.id = newUUID;
  // });
  // ask my quiz list
  socket.emit('quizList-request');

  socket.on('quizList-response', quizzes => {
    if (quizzes != null) {
      quizzes.forEach(quiz => {
        console.log('quiz :>> ', quiz);
      });
    }
  });
});
