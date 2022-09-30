const redis = require('../database/redis_connexion');
const connection = require('../database/mysql_connexion');
const date = require('date-and-time');
const fs = require('fs');
require('dotenv').config();

exports.sendMessage = async (req, res, next) => {
    let sql = `INSERT INTO messages (content, sender, recipient, created_at) VALUES (?, ?, ?, ?);`;
    let sqlVariables = [req.body.message, req.user.userId, req.params.id, date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')];
    connection.query(sql, sqlVariables, async (err, result) => {
        if (err) {
            return res.status(500).json({ error: err })
        };
        if (result.affectedRows === 1) {
            let numConversation = "";
            if (req.user.userId > req.params.id) {
                numConversation = `${req.params.id}-${req.user.userId}`
            } else {
                numConversation = `${req.user.userId}-${req.params.id}`
            };
            const alreadyTexted = await redis.get(`conversation:${numConversation}`);
            if (alreadyTexted == null) {
                await redis.set(
                    `conversation:${numConversation}`,
                    JSON.stringify(
                        {
                            id: 1,
                            content: req.body.message,
                            message_id_mysql: result.insertId,
                            sender: req.user.userId,
                            recipient: parseInt(req.params.id)
                        }
                    )
                );
                let arrayOfUsers = await redis.mGet([`user:${req.user.userId}`, `user:${req.params.id}`]);
                let arr = [];
                for (let i = 0; i < arrayOfUsers.length; i++) {
                    let user = JSON.parse(arrayOfUsers[i]);
                    user.conversations.push(numConversation);
                    if (i == 0) {
                        arr.push(`user:${req.user.userId}`)
                    } else {
                        arr.push(`user:${req.params.id}`)
                    };
                    arr.push(JSON.stringify(user))
                };
                await redis.MSET(arr);
                res.status(200).json({ message: "Message envoyé", message_sended_id: 1 })
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
                            content: req.body.message,
                            message_id_mysql: result.insertId,
                            sender: req.user.userId,
                            recipient: parseInt(req.params.id)
                        }
                    )
                );
                res.status(200).json({ message: 'message envoyé', message_sended_id: idRefer + 1 })
            }
        }
    })
};

exports.getUsersConnected = async (req, res, next) => {
    try {
        const connected = await redis.get(`connected`);
        const arr = `[${connected}]`;
        const userConnectedData = JSON.parse(arr);
        res.status(200).json(userConnectedData)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error, message: 'Un problème est survenu' })
    }
};

exports.getMessageOfConversation = async (req, res, next) => {
    let numConversation = "";
    if (req.user.userId > req.params.id) {
        numConversation = `${req.params.id}-${req.user.userId}`
    } else {
        numConversation = `${req.user.userId}-${req.params.id}`
    };
    const msg = await redis.get(`conversation:${numConversation}`);
    if (msg != null && req.query.from == 0) {
        const arr = `[${msg}]`;
        const conv = JSON.parse(arr);
        if (conv.length < 25) {
            let sql = `SELECT * FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY id DESC LIMIT 25 OFFSET ?;`;
            let sqlVariables = [req.user.userId, req.params.id, req.params.id, req.user.userId, conv.length];
            connection.query(sql, sqlVariables, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err })
                } else if (result.length > 0) {
                    result.map((item) => {
                        conv.unshift(item)
                    });
                    res.status(200).json(conv)
                } else if (result.length == 0 && conv.length > 0) {
                    res.status(200).json(conv)
                } else {
                    res.status(200).json({ message: 'Aucun message' })
                }
            })
        } else {
            res.status(200).json(conv)
        }
    } else {
        let limitValue = parseInt(req.query.limit);
        let from = parseInt(req.query.from);
        let sql = `SELECT * FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY id DESC LIMIT ? OFFSET ?;`;
        let sqlVariables = [req.user.userId, req.params.id, req.params.id, req.user.userId, limitValue, from];
        connection.query(sql, sqlVariables, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err })
            };
            if (result.length > 0) {
                let conv = [];
                result.map((item) => {
                    conv.unshift(item)
                });
                res.status(200).json(conv)
            } else {
                res.status(200).json({ message: "Aucun message" })
            }
        })
    }
};

exports.countMessages = async (req, res, next) => {
    let sql = `SELECT COUNT(*) AS count FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?);`;
    let sqlVariables = [req.user.userId, req.params.id, req.params.id, req.user.userId];
    connection.query(sql, sqlVariables, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err })
        };
        if (result.length > 0) {
            res.status(200).json(result[0])
        } else {
            res.status(200).json({ message: "Aucun message" })
        }
    })
};