const express = require('express');
const redisClient = require('../services/redis_connection');
const redisLock = require('../services/redis_lock');
const replace = require('replace-in-file');
var fs = require('fs');

const router = express.Router();

const {User} = require('../models/User');

router.post('/d', (req, res) => {
    console.log("-------------------PROCESS: " + process.pid);
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

router.post('/apiKey', (req, res) => {
    updateApiKey(req.query.key.trim(), parseInt(req.query.v, 10))
        .then((e) => {
            res.status(201).send(e);
        }).catch(err => res.status(500).send(err))
});

router.get('/apiKeys', (req, res) => {
    getApiKeys()
        .then((e) => {
            res.status(201).send(e);
        }).catch(err => res.status(500).send(err))
});


router.get('/d', (req, res) => {

});

router.get('/e', (req, res) => {

});

function getApiKeys() {
    return new Promise(async (resolve, reject) => {
        fs.readFile('./cfg.txt', function (err, data) {
            console.log('======================');
            if (err) {
                console.log("PROCESS " + process.pid + " READ FROM FILE AND GOT ERROR: " + err);
                return reject(err);
            }
            console.log("PROCESS " + process.pid + " READ FROM FILE: ");
            console.log(data);
            resolve(data);
        });

    });
}

function updateApiKey(key, value) {
    return new Promise(async (resolve, reject) => {
        const regex = new RegExp("^ *" + key + ".*");
        const to = `${key} ${value}`;
        const options = {
            files: "./cfg.txt",
            from: regex,
            to: to
        };

        try {
            const lock = await redisLock.retryableLock(key, 20000, 1000);
            if (lock !== 1) {
                return reject({name: "lock failed", message: "could not acquire lock"});
            }

            const results = await replace(options);
            console.log('======================');
            console.log("PROCESS " + process.pid + " CHANGED THE FILE");
            console.log('Replacement results:', results);

            await redisClient.set(key, value);

            // busy CPU here
            var startTime = Date.now();
            while ((Date.now() - startTime) < 30000) { }

            resolve(results);

        } catch (error) {
            console.error('Error occurred:', error);
            reject(error);
        }

        await redisLock.unlock(key);

    });
}

function changeD(d) {
    return new Promise(async (resolve, reject) => {
        await redisLock.retryableLock("d", 120000, 5000);
        await redisClient.set("d", d);
        await redisLock.unlock("d");

        const result = await redisClient.get("d");
        resolve(result)
    });
}

function changeE(e) {
    return new Promise(async (resolve, reject) => {
        await redisLock.retryableLock("e");
        await redisClient.set("e", e);
        await redisLock.unlock("e");

        const result = await redisClient.get("e");
        resolve(result)
    });
}


module.exports = router;