const express = require('express');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const publicationsRoutes = require('./routes/publications.routes');
const commentsRoute = require('./routes/comments.routes');
const friendsRoutes = require('./routes/friends.routes');
const app = express();
const auth = require('./middlewares/auth');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/publications', auth.accesToken, publicationsRoutes);
app.use('/api/publications/:id', auth.accesToken, commentsRoute);
app.use('/api/user', auth.accesToken, usersRoutes);
app.use('/api/friends', auth.accesToken, friendsRoutes);

module.exports = app;