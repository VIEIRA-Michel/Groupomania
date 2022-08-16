const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};


server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const picture = socket.handshake.auth.picture;
  if (!username) {
    return next(new Error('authentication error'));
  }
  socket.username = username;
  socket.picture = picture;
  next();
})

io.on('connection', (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
      picture: socket.picture,
    });
  }
  socket.emit("users", users);
  console.log(users);
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
    picture: socket.picture,
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
  });
  // socket.on('chat-message', (msg) => {
  //   socket.broadcast.emit('chat-message', msg)
  // })
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  })
  socket.on('stoptyping', (data) => {
    socket.broadcast.emit('stoptyping', data)
  })

});

server.listen(port);
