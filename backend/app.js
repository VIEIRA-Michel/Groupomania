const express = require('express');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const publicationsRoutes = require('./routes/publications.routes');
const commentsRoute = require('./routes/comments.routes');
const friendsRoutes = require('./routes/friends.routes');
const chatRoutes = require('./routes/chat.routes');
const app = express();
const auth = require('./middlewares/auth');
const rateLimiter = require('./middlewares/rateLimiter');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next()
});
app.use(cors());

const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', rateLimiter.authtLimiter, authRoutes);
app.use('/api/publications', rateLimiter.navigateLimiter, auth.accesToken, publicationsRoutes);
app.use('/api/publications', rateLimiter.navigateLimiter, auth.accesToken, commentsRoute);
app.use('/api/user', rateLimiter.navigateLimiter, auth.accesToken, usersRoutes);
app.use('/api/user', rateLimiter.navigateLimiter, auth.accesToken, chatRoutes);
app.use('/api/friends', rateLimiter.navigateLimiter, auth.accesToken, friendsRoutes);

module.exports = app;