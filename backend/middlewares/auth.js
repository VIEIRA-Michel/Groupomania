const jwt = require('jsonwebtoken');

exports.accesToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });

}

exports.refreshToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        delete user.iat;
        delete user.exp;
        const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
        res.send({ accessToken: refreshToken });
    });
}