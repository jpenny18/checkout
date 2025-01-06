const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendPaymentConfirmation = async (payment) => {
    try {
        const user = await User.findById(payment.userId);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Payment Received - The Best Checkout',
            html: `
                <h2>Payment Received!</h2>
                <p>Dear ${user.firstName},</p>
                <p>We've received your payment of ${payment.amount} ${payment.cryptoType}.</p>
                <p>Transaction ID: ${payment.transactionId}</p>
                <p>Status: ${payment.status}</p>
                <p>Thank you for your business!</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

module.exports = { sendPaymentConfirmation }; 