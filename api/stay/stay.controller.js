const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const stayService = require('./stay.service')

async function getStays(req, res) {
    try {
        const stays = await stayService.query(req.query)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}

// Get a single stay by id
async function getStay(req, res) {
    try {
        console.log('req.params', req.params);
        const stayId = req.params.id;
        const stay = await stayService.getById(stayId)
        res.send(stay)
    } catch (err) {
        logger.error('Cannot get stay', err)
        res.status(500).send({ err: 'Failed to get stay' })
    }
    // const stayId = req.params.stayId
    // stayService.getById(stayId)
    //     .then(stay => {
    //         res.json(stay)
    //     })
}

async function deleteStay(req, res) {
    try {
        await stayService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete stay', err)
        res.status(500).send({ err: 'Failed to delete stay' })
    }
}


async function addStay(req, res) {
    try {
        var stay = req.body
        stay.byUserId = req.session.user._id
        stay = await stayService.add(stay)
        
        // prepare the updated stay for sending out
        stay.byUser = await userService.getById(stay.byUserId)
        stay.aboutUser = await userService.getById(stay.aboutUserId)

        console.log('CTRL SessionId:', req.sessionID);
        socketService.broadcast({type: 'stay-added', data: stay})
        socketService.emitToAll({type: 'user-updated', data: stay.byUser, room: req.session.user._id})
        res.send(stay)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

// Update a Stay
async function updateStay(req, res) {
    // const { name, price, type, inStock, _id, createdAt } = req.body
    // const stay = { _id, name, price, type, inStock, createdAt }
    // stayService.save(stay)
    //     .then((savedStay) => {
    //         console.log('Updated Stay:', savedStay);
    //         res.json(savedStay)
    //     })
    //     .catch(err => {
    //         console.log(err)
    //         return res.status(401).send('access denied')
    //     })

    try {
        const stay = req.body
        const savedStay = await stayService.update(stay)
        // console.log('savedStay', savedStay);
        res.send(savedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })
    }

    // try {
    //     const { name, price, type, inStock, _id, createdAt } = req.body
    //     const stay = { _id, name, price, type, inStock, createdAt }
    //     stay = await stayService.save(stay)
    //     res.send(stay)
    // } catch (err) {
    //     logger.error('Failed to update stay', err)
    //     res.status(500).send({ err: 'Failed to update stay' })
    // }
}
module.exports = {
    getStays,
    deleteStay,
    addStay,
    getStay,
    updateStay
}