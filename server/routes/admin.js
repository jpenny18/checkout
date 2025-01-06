const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CryptoPayment = require('../models/CryptoPayment');
const { decrypt } = require('../utils/encryption');
const EmailNotifier = require('../utils/emailNotifications');

// Admin authentication middleware
const authAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.ADMIN_API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Get all users (with pagination)
router.get('/users', authAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get crypto payments (with pagination)
router.get('/crypto-payments', authAdmin, async (req, res) => {
    try {
        const { status = 'all', page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status !== 'all') {
            query.status = status;
        }

        const payments = await CryptoPayment.find(query)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await CryptoPayment.countDocuments(query);

        res.json({
            success: true,
            payments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching crypto payments:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payments' });
    }
});

// Update crypto payment status
router.patch('/crypto-payments/:id', authAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const payment = await CryptoPayment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('userId');

        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                error: 'Payment not found' 
            });
        }

        if (status === 'approved') {
            await EmailNotifier.sendPaymentApproved(payment);
        } else if (status === 'rejected') {
            await EmailNotifier.sendPaymentRejected(payment);
        }

        res.json({ success: true, payment });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update payment'
        });
    }
});

// Add this route to handle settings updates
router.post('/settings', authAdmin, async (req, res) => {
    try {
        const { maxAutoAmount, minPrevPayments } = req.body;
        
        // Update environment variables (in memory)
        process.env.MAX_AUTO_APPROVE_AMOUNT = maxAutoAmount;
        process.env.MIN_PREVIOUS_PAYMENTS = minPrevPayments;

        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});

module.exports = router; 