const mongoose = require('mongoose');

let options = {useNewUrlParser: true};

mongoose.connect("mongodb://35.200.131.140:1111/dummy", options)
    .then(() => console.log('Connected to MongoDb...'));

module.exports.close = function() {
    return mongoose.disconnect();
};