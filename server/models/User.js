const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null,
    },
    social: {
        type: String,
        default: null,
    },
    saved: {
        type: Array,
        default: null
    },
    liked: {
        type: Array,
        defualt: null
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;