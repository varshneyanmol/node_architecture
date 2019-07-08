const express = require('express');
const redisClient = require('../services/redis_connection');
const redisLock = require('../services/redis_lock');

const router = express.Router();

const {User} = require('../models/User');

router.post('/d', (req, res) => {
    console.log("-------------------PROCESS: " + process.pid)
    changeD(parseInt(req.query.v, 10))
        .then((d) => {
            res.status(201).send(d);
        }).catch(err => res.status(500).send(err))
});

router.post('/e', (req, res) => {
    changeE(parseInt(req.query.v, 10))
        .then((e) => {
            res.status(201).send(e);
        }).catch(err => res.status(500).send(err))
});

router.get('/d', (req, res) => {
});

router.get('/e', (req, res) => {
});


function changeD(d) {
    return new Promise(async(resolve, reject) => {
        await redisLock.retryableLock("d", 120000, 5000);
        await redisClient.set("d", d);
        await redisLock.unlock("d");

        const result = await redisClient.get("d");
        resolve(result)
    });
}

function changeE(e) {
    return new Promise(async(resolve, reject) => {
        await redisLock.retryableLock("e");
        await redisClient.set("e", e);
        await redisLock.unlock("e");

        const result = await redisClient.get("e");
        resolve(result)
    });
}


module.exports = router;