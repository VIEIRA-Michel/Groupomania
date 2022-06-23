const express = require('express');
const usersRoutes = require('./routes/users.routes');
const publicationsRoutes = require('./routes/publications.routes');
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

app.use('/api/auth', usersRoutes);
app.get('/api/me', auth.accesToken, (req, res) => {
    res.send(req.user);
});
app.post('/api/refresh', auth.refreshToken, (req, res) => {
    res.send(req.user);
});
app.use('/api/home', auth.accesToken, publicationsRoutes);

module.exports = app;