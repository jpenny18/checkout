const nodemailer = require('nodemailer');

class EmailNotifier {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendDailySummary(payments) {
        const summary = this.generateSummary(payments);
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Daily Payments Summary',
            html: summary
        });
    }

    async sendLowBalanceAlert(balance, threshold) {
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: '⚠️ Low Balance Alert',
            html: `Current balance (${balance}) is below threshold (${threshold})`
        });
    }

    generateSummary(payments) {
        const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const pending = payments.filter(p => p.status === 'pending').length;
        
        return `
            <h2>Daily Summary</h2>
            <p>Total Payments: ${payments.length}</p>
            <p>Total Amount: ${total}</p>
            <p>Pending Approvals: ${pending}</p>
        `;
    }
}

module.exports = new EmailNotifier(); 