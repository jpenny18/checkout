const mongoose = require('mongoose');

const cryptoPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    cryptoType: {
        type: String,
        enum: ['BTC', 'ETH', 'USDT'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    screenshot: {
        type: String,  // URL to stored image
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CryptoPayment', cryptoPaymentSchema); 