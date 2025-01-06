const cron = require('node-cron');
const EmailNotifier = require('./emailNotifications');
const CryptoPayment = require('../models/CryptoPayment');

// Daily summary at 11:59 PM
cron.schedule('59 23 * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const payments = await CryptoPayment.find({
        createdAt: { $gte: today }
    }).populate('userId');

    await EmailNotifier.sendDailySummary(payments);
});

// Auto-approve pending payments after 24h if no issues
cron.schedule('*/30 * * * *', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    await CryptoPayment.updateMany({
        status: 'pending',
        createdAt: { $lte: yesterday },
        amount: { $lte: 5000 }, // Safe threshold
        'userId.hasDisputes': false
    }, {
        status: 'approved'
    });
}); 