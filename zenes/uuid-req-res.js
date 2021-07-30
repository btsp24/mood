after connection section
console.log('req.user :>> ', app.locals.user.id);

other methods will come here

socket.on('UUID-request', () => {
  console.log('s: UUID', {
    old: socket.conn.id,
    new: app.locals.user.id,
  });
  socket.conn.id = app.locals.user.id;
  socket.emit('UUID-response', app.locals.user.id);
});
