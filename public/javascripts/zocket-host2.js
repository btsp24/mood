console.log('from host side in html');
const socket = io();

const urlParams = new URLSearchParams(window.location.search);

const params = {
  quizId: urlParams.get('quizId'),
};

socket.on('connect', function () {
  console.log('socket.io.engine.id 2 :>> ', socket.io.engine.id);
  // socket.emit('player-join-game');
  console.log('this is zocket-host2 :>> ');
});
