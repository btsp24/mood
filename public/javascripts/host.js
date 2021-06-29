console.log('from :>> ', 'host/hostjs');
const socket = io();

socket.on('connect', () => {
  console.log('connected :>> ', socket.io.engine.id);
  socket.emit('requestDbNames'); // Get database names to display to user
});
socket.on('gameNamesData', function (data) {
  console.log(data);
  for (var i = 0; i < Object.keys(data).length; i++) {
    var div = document.getElementById('game-list');
    var button = document.createElement('button');

    button.innerHTML = data[i].title;
    button.setAttribute('onClick', "startGame('" + data[i].id + "')");
    button.setAttribute('id', 'gameButton');

    div.appendChild(button);
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));
  }
});

function startGame(data) {
  window.location.href = '/host/' + '?id=' + data;
}
