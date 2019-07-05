const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    exam: {
        type: String
    },
    sub_exam: {
        type: String
    }
});

const User = mongoose.model('User', UserSchema);

module.exports.User = User;