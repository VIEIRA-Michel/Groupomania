const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const redis = require('./database/redis_connexion');
const { Server } = require("socket.io");
require('dotenv').config();

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

(async () => {
  await redis.connect(); // if using node-redis client.
})();

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  const user_id = socket.handshake.auth.user;
  if (sessionID) {
    (async () => {
      const session = await redis.get(`user:${user_id}`);
      const sessionData = JSON.parse(session);
      if (session) {
        socket.sessionID = sessionData.session_id;
        socket.userID = sessionData.userID;
        socket.user = sessionData.user;
        socket.username = sessionData.username;
        socket.picture = sessionData.picture;
        return next();
      }
    })();
  }
})

io.on('connection', (socket) => {
  (async () => {
    const alreadyConnected = await redis.get(`connected`);
    if (!alreadyConnected) {
      await redis.set(`connected`,
        JSON.stringify({
          userID: socket.userID,
          user: socket.user,
          username: socket.username,
          picture: socket.picture,
          connected: true,
        })
      );
    } else {
      const userConnected = await redis.get(`connected`);
      const arr = `[${userConnected}]`;
      const userConnectedData = JSON.parse(arr);

      if (userConnectedData.find(user => user.userID == socket.userID)) {
        console.log('lutilisateur est deja présent');
      } else {
        await redis.append(`connected`, ',');
        await redis.append(`connected`, JSON.stringify({
          userID: socket.userID,
          user: socket.user,
          username: socket.username,
          picture: socket.picture,
          connected: true,
        }));
      }
    }
  })();

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.join(socket.userID);

  let users = [];
  (async () => {
    const connected = await redis.get(`connected`);
    const arr = `[${connected}]`;
    const userConnectedData = JSON.parse(arr);
    for (let i = 0; i < userConnectedData.length; i++) {
      if (userConnectedData[i].connected) {
        users.push(userConnectedData[i]);
      }
    }
    socket.emit("users", users);
  })();

  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    user: socket.user,
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
      (async () => {
        const connected = await redis.get(`connected`);
        const arr = `[${connected}]`;
        const userConnectedData = JSON.parse(arr);
        let userConnectedDataFiltered = "";
        for (let i = 0; i < userConnectedData.length; i++) {
          if (userConnectedData[i].userID != socket.userID) {
            if (userConnectedDataFiltered != "") {
              userConnectedDataFiltered += ",";
            }
            userConnectedDataFiltered += JSON.stringify(userConnectedData[i]);
          }
        }
        await redis.set(`connected`, userConnectedDataFiltered);
        const result = await redis.get(`connected`);
      })();
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  });
  socket.on('stoptyping', (data) => {
    socket.broadcast.emit('stoptyping', data)
  });
  socket.on('like', (data) => {
    socket.broadcast.emit('like', data)
  });
  socket.on('remove like', (data) => {
    socket.broadcast.emit('remove like', data)
  });
  socket.on('new publication', (data) => {
    socket.broadcast.emit('new publication', data)
  });
  socket.on('edit publication', (data) => {
    socket.broadcast.emit('edit publication', data)
  });
  socket.on('delete publication', (data) => {
    socket.broadcast.emit('delete publication', data)
  });
  socket.on('has commented', (data) => {
    socket.broadcast.emit('has commented', data)
  });
  socket.on('delete comment', (data) => {
    socket.broadcast.emit('delete comment', data)
  });
  socket.on('friendRequest sended', (data) => {
    socket.broadcast.emit('friendRequest sended', data)
  });
  socket.on('friendRequest accepted', (data) => {
    socket.broadcast.emit('friendRequest accepted', data)
  });
  socket.on('friendRequest refused', (data) => {
    socket.broadcast.emit('friendRequest refused', data)
  });
  socket.on('friend removed', (data) => {
    socket.broadcast.emit('friend removed', data)
  })
  socket.on('friendRequest canceled', (data) => {
    socket.broadcast.emit('friendRequest canceled', data)
  })

});

server.listen(port);