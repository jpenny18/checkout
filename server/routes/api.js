const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CryptoPayment = require('../models/CryptoPayment');
const verifications = require('../utils/cryptoVerification');
const { verifyPayment } = require('../utils/autoVerification');
const adminNotifier = require('../utils/adminNotifications');
const customerNotifier = require('../utils/customerNotifications');
const { cryptoPaymentValidation, validate } = require('../middleware/validation');
const { authAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Collect user data
router.post('/collect-user-data', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        const {
            firstName,
            lastName,
            email,
            phone,
            country,
            challengeType,
            challengeAmount,
            platform
        } = req.body;
        console.log('Parsed data:', { firstName, lastName, email });

        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (user) {
            // Update existing user
            user.firstName = firstName;
            user.lastName = lastName;
            user.phone = phone;
            user.country = country;
            user.challengeType = challengeType;
            user.challengeAmount = challengeAmount;
            user.platform = platform;
            
            await user.save();
        } else {
            // Create new user
            user = new User({
                firstName,
                lastName,
                email,
                phone,
                country,
                challengeType,
                challengeAmount,
                platform
            });
            await user.save();
        }

        res.json({ 
            success: true, 
            message: 'Data collected successfully',
            userId: user._id 
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            mongoState: mongoose.connection.readyState
        });
        res.status(500).json({ 
            success: false, 
            error: 'Failed to collect user data' 
        });
    }
});

// Submit crypto payment with validation and notifications
router.post('/crypto-payment', cryptoPaymentValidation, validate, async (req, res) => {
    try {
        const { userId, amount, cryptoType, transactionId, screenshot } = req.body;
        
        // Get the verification function for this crypto type
        const verifyPayment = verifications[cryptoType];
        if (!verifyPayment) {
            return res.status(400).json({
                success: false,
                error: `Unsupported cryptocurrency: ${cryptoType}`
            });
        }

        // Attempt automatic verification
        const isVerified = await verifyPayment(transactionId, parseFloat(amount));

        // Create and save payment record
        const payment = new CryptoPayment({
            userId,
            amount,
            cryptoType,
            transactionId,
            screenshot,
            status: isVerified ? 'approved' : 'pending'
        });

        // Add auto-verification
        const autoVerificationResult = await verifyPayment(payment);
        if (autoVerificationResult !== null) {
            payment.status = autoVerificationResult ? 'approved' : 'rejected';
        }

        await payment.save();

        // Update user's payment history
        await User.findByIdAndUpdate(userId, {
            $inc: { 
                previousPayments: payment.status === 'approved' ? 1 : 0,
                failedAttempts: payment.status === 'rejected' ? 1 : 0
            }
        });

        // Get user details for notifications
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Send notifications
        if (isVerified) {
            await Promise.all([
                customerNotifier.sendPaymentConfirmation(payment, user),
                adminNotifier.notifyNewPayment({...payment.toObject(), userId: user})
            ]);
        } else {
            // Only notify admin for manual verification
            await adminNotifier.notifyNewPayment({...payment.toObject(), userId: user});
        }
        
        res.json({ 
            success: true, 
            payment,
            verified: isVerified,
            message: isVerified ? 
                'Payment verified and processed successfully' : 
                'Payment received, awaiting verification'
        });
    } catch (error) {
        console.error('Error processing crypto payment:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process payment'
        });
    }
});

// Admin routes for crypto payments
router.get('/admin/crypto-payments', authAdmin, async (req, res) => {
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

// Update payment status with notifications
router.patch('/admin/crypto-payments/:id', authAdmin, async (req, res) => {
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

        // Send notifications based on status update
        if (status === 'approved') {
            await customerNotifier.sendPaymentConfirmation(payment, payment.userId);
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

// Add this test endpoint near your other routes
router.post('/test/create-user', async (req, res) => {
    console.log("Received request to create test user");
    try {
        const testUser = new User({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            phone: "+1234567890",
            country: "US",
            challengeType: "FTMO",
            challengeAmount: "100000",
            platform: "MT4"
        });

        console.log("Saving test user...");
        await testUser.save();
        console.log("Test user saved:", testUser);
        
        res.json({ 
            success: true, 
            message: 'Test user created',
            userId: testUser._id
        });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create test user' 
        });
    }
});

// Add this endpoint to get all users (for testing)
router.get('/test/users', async (req, res) => {
    try {
        const users = await User.find().select('_id firstName lastName email');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// Add payment status check endpoint
router.post('/check-payment-status', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        const payment = await CryptoPayment.findOne({
            userId,
            amount,
            status: 'approved'
        }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            status: payment ? 'approved' : 'pending'
        });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check payment status' 
        });
    }
});

// Add error handling middleware
router.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

module.exports = router; 