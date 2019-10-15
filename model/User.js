const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: false,
        min:2,
    },

    lastName: {
        type: String,
        required: false,
        min:2,
    },

    userName: {
        type: String,
        required: true,
        min:4,
        max:12,
    },

    email: {
        type: String,
        required: true,
        min: 3,
        max: 255,
    },

    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },

    mobile: {
        type: String,
        required: true,
        min: 11,
        max:12,
    },

    date: {
        type: Date,
        default: Date.now,
    }

});

module.exports = mongoose.model('User', userSchema);