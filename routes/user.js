const express = require('express');
const router = express.Router();

const {User} = require('../models/User');

router.post('/', (req, res) => {
    createUser(req.query.name, req.query.email, req.query.exam, req.query.subExam)
        .then((user) => {
            res.status(201).send(user);
        }).catch(err => res.status(500).send(err))
});

router.get('/', (req, res) => {
    getUser(req.query.userId)
        .then((user) => {
            res.status(200).send(user)
        })
        .catch(err => res.status(404).send(err))
});

router.get('/byExam', (req, res) => {
    getUserByExam(req.query.exam)
        .then((users) => {
            res.status(200).send(users)
        })
        .catch(err => res.status(404).send(err))
});


function createUser(name, email, exam, subExam) {
    return new Promise((resolve, reject) => {
        const user = new User({
            name: name,
            email: email,
            exam: exam,
            sub_exam: subExam
        });

        user.save(function (err, user) {
            if (err) {
                reject(err);
            } else if (user) {
                resolve(user)
            } else {
                reject({name: "Unknown Error", message: "Some error occurred"})
            }
        })
    });
}

function getUser(userId) {
    return new Promise(async (resolve, reject) => {
        await User.findById(userId)
            .exec(function (err, user) {
                if (err) reject(err);
                else if (user) resolve(user);
                else reject({name: 'Invalid userId', message: `User not found for ID: ${userId}`});
            });
    });
}

function getUserByExam2(exam) {
    return new Promise(async (resolve, reject) => {

        try {
            const users = await User.aggregate([{$match: {exam: exam}}, {$project: {__v: 0}}]).cache();
            if (!users) return reject({name: 'Invalid exam', message: `Users not found for exam: ${exam}`});
            resolve(users);
        } catch(err) {
            reject(err);
        }


        // User.aggregate([{$match: {exam: exam}}])
        //     .exec(function (err, users) {
        //         if (err) reject(err);
        //         else if (users) resolve(users);
        //         else reject({name: 'Invalid exam', message: `Users not found for exam: ${exam}`});
        //     });
    });
}


function getUserByExam(exam) {
    return new Promise(async (resolve, reject) => {

        try {
            const users = await User.find({exam: exam}).cache();
            if (!users) return reject({name: 'Invalid exam', message: `Users not found for exam: ${exam}`});
            resolve(users);
        } catch(err) {
            reject(err);
        }

    });
}


module.exports = router;