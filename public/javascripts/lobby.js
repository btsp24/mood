var socket = io({ transports: ['websocket'], upgrade: false });
//var params = jQuery.deparam(window.location.search);
const urlParams = new URLSearchParams(window.location.search);

const params = {
  id: urlParams.get('id'),
};

//When host connects to server
socket.on('connect', function () {
  document.getElementById('players').value = '';

  //Tell server that it is host connection
  console.log(params, 'params');
  socket.emit('host-join', params);
});

socket.on('showGamePin', function (data) {
  console.log(data, 'id');
  document.getElementById('gamePinText').innerHTML = data.pin;
});

//Adds player's name to screen and updates player count
socket.on('updatePlayerLobby', function (data) {
  console.log(data);
  document.getElementById('players').value = '';

  for (var i = 0; i < data.length; i++) {
    console.log(data);
    document.getElementById('players').value += data[i].name + '\n';
  }
});

//Tell server to start game if button is clicked
function startGame(e) {
  socket.emit('startGame');
}
function endGame() {
  window.location.href = '/';
}

//When server starts the game
socket.on('gameStarted', function (id) {
  console.log('Game Started!');
  window.location.href = '/host/game/' + '?id=' + id;
});

socket.on('noGameFound', function () {
  window.location.href = '../../'; //Redirect user to 'join game' page
});
