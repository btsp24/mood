console.log('from player side side in html');
const socket = io();

const urlParams = new URLSearchParams(window.location.search);

const params = {
  quizId: urlParams.get('quizId'),
};

socket.on('connect', function () {
  console.log('socket.io.engine.id :>> ', socket.io.engine.id);
  // socket.emit('player-join-game');
});
