const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

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

io.on('connection', (socket) => {
  console.log('un utilisateur est connecté');
  io.emit('noOfConnections', io.engine.clientsCount);

  socket.on('disconnect', () => {
    console.log('un utilisateur est déconnecté');
    io.emit('noOfConnections', io.engine.clientsCount);
  });

  socket.on('chat-message', (msg) => {
    socket.broadcast.emit('chat-message', msg)
  })
  socket.on('joined', (name) => {
    socket.broadcast.emit('joined', name)
  })
  socket.on('leaved', (name) => {
    socket.broadcast.emit('leaved', name)
  })

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  })
  socket.on('stoptyping', () => {
    socket.broadcast.emit('stoptyping')
  })

});

server.listen(port);
