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
                    id: 1,
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
        res.status(200).json({ message: "Message envoyé", message_sended_id: 1 });

    } else {
        const msgParse = `[${alreadyTexted}]`;
        const idRefer = JSON.parse(msgParse).pop().id;
        await redis.append(
            `conversation:${numConversation}`, ',');
        await redis.append(
            `conversation:${numConversation}`,
            JSON.stringify(
                {
                    id: idRefer + 1,
                    message: req.body.message,
                    from: req.body.from,
                    to: req.body.to
                }
            )
        );
        res.status(200).json({ message: 'message envoyé', message_sended_id: idRefer + 1 });
    }
};

exports.getAllMessages = async (req, res, next) => {
    const msg = await redis.get(`user:${req.user.userId}`);
    if (msg != null) {
        const messages = JSON.parse(msg).conversations;
        let inbox = [];
        for (let i = 0; i < messages.length; i++) {
            let conversationMessages = await redis.get(`conversation:${messages[i]}`);
            let arr = `[${conversationMessages}]`;
            const conv = JSON.parse(arr);
            for (let j = 0; j < conv.length; j++) {
                inbox.push(conv[j]);
            }
        }
        res.status(200).json(inbox);
    } else {
        res.status(200).json({ message: "Pas de messages" });
    }
}

exports.getUsersConnected = async (req, res, next) => {
    const connected = await redis.get(`connected`);
    const arr = `[${connected}]`;
    const userConnectedData = JSON.parse(arr);
    res.status(200).json(userConnectedData);
};

exports.getMessageOfConversation = async (req, res, next) => {
    console.log(req.params.id);
    const msg = await redis.get(`conversation:${req.params.id}`);
    if (msg != null) {
        const arr = `[${msg}]`;
        const conv = JSON.parse(arr);
        res.status(200).json(conv);
    } else {
        res.status(200).json({ message: "Pas de messages" });
    }
}