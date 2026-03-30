var express = require('express');
var router = express.Router();
let messageModel = require('../schemas/messages')
let { checkLogin } = require('../utils/authHandler.js')

router.get('/', checkLogin, async function (req, res, next) {
    try {
        let userId = req.userId;
        let messages = await messageModel.find({
            $or: [
                { from: userId },
                { to: userId }
            ]
        }).sort({ createdAt: -1 }).populate('from').populate('to')
        let listUser = [];
        let result = [];
        for (const item of messages) {
            let partnerId = item.from._id == userId ? item.to._id : item.from._id;
            if (!listUser.includes(partnerId.toString())) {
                listUser.push(partnerId.toString())
                result.push(item)
            }
        }
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.get('/:userId', checkLogin, async function (req, res, next) {
    try {
        let currentUserId = req.userId;
        let otherUserId = req.params.userId;
        let result = await messageModel.find({
            $or: [
                {
                    from: currentUserId,
                    to: otherUserId
                },
                {
                    from: otherUserId,
                    to: currentUserId
                }
            ]
        }).sort({ createdAt: 1 }).populate('from').populate('to')
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.post('/', checkLogin, async function (req, res, next) {
    try {
        let newMessage = new messageModel({
            from: req.userId,
            to: req.body.to,
            messageContent: {
                type: req.body.messageContent.type,
                text: req.body.messageContent.text
            }
        })
        let result = await newMessage.save()
        result = await result.populate('from').populate('to')
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = router;
