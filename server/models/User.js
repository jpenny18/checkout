const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    challengeType: {
        type: String,
        required: true
    },
    challengeAmount: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    previousPayments: {
        type: Number,
        default: 0
    },
    hasDisputes: {
        type: Boolean,
        default: false
    },
    failedAttempts: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema); 