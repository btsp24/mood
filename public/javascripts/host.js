console.log('from :>> ', 'host/hostjs');
const socket = io();

socket.on('connect', () => {
  console.log('connected :>> ', socket.io.engine.id);
});
