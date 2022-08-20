const redis = require('../database/redis_connexion');
require('dotenv').config();

exports.sendMessage = async (req, res, next) => {
    let numConversation = "";
    if (req.body.from > req.body.to) {
        numConversation = `${req.body.to}${req.body.from}`
    } else {
        numConversation = `${req.body.from}${req.body.to}`
    }
    const alreadyTexted = await redis.get(`conversation:${numConversation}`);
    if (alreadyTexted == null) {
        await redis.set(
            `conversation:${numConversation}`,
            JSON.stringify(
                {
                    message: req.body.message,
                    from: req.body.from,
                    to: req.body.to
                }
            )
        );
        let arrayOfUsers = await redis.mGet([`user:${req.body.from}`, `user:${req.body.to}`]);
        let arr = []
        for (let i = 0; i < arrayOfUsers.length; i++) {
            let user = JSON.parse(arrayOfUsers[i]);
            user.conversations.push(numConversation);
            if (i == 0) {
                arr.push(`user:${req.body.from}`);
            } else {
                arr.push(`user:${req.body.to}`);
            }
            arr.push(JSON.stringify(user));
        };
        await redis.MSET(arr);
        res.status(200).json({ message: "Message envoyé" });

    } else {
        await redis.append(
            `conversation:${numConversation}`,
            JSON.stringify(
                { 
                    message: req.body.message,
                    from: req.body.from,
                    to: req.body.to
                }
            )
        );
        res.status(200).json({ message: 'message envoyé' });
    }
};

exports.getAllMessages = async (req, res, next) => {

}
