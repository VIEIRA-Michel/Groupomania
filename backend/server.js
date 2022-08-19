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

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      socket.picture = session.picture;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  const picture = socket.handshake.auth.picture;
  if (!username) {
    return next(new Error('authentication error'));
  }

  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  socket.picture = picture;
  next();
})

io.on('connection', (socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    picture: socket.picture,
    connected: socket.connected,
  });

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.join(socket.userID);

  let users = [];
  sessionStore.findAllSessions().forEach((session) => {
    if(session.connected) {
      users.push({
        userID: session.userID,
        username: session.username,
        picture: session.picture,
        connected: session.connected,
      });
    }
  });

  
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    picture: socket.picture,
    connected: true,
  });

  socket.on("private message", ({ content, to }) => {
    socket.to(to).to(socket.userID).emit("private message", {
      content,
      from: socket.userID,
      to,
    });
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", socket.userID);
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        picture: socket.picture,
        connected: false,
      });
    }
  });
  
  socket.emit("users", users);

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  })
  socket.on('stoptyping', (data) => {
    socket.broadcast.emit('stoptyping', data)
  })

});

server.listen(port);
