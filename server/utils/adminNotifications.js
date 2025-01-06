const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { WebClient } = require('@slack/web-api');

class AdminNotifier {
    constructor() {
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        if (process.env.TWILIO_ENABLED === 'true' && 
            process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        }

        if (process.env.SLACK_ENABLED === 'true' && process.env.SLACK_BOT_TOKEN) {
            this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
        }
    }

    async notifyNewPayment(payment) {
        await Promise.all([
            this.sendEmail(payment),
            this.sendSMS(payment),
            this.sendSlackMessage(payment)
        ]);
    }

    async sendEmail(payment) {
        try {
            await this.emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `New ${payment.cryptoType} Payment - ${payment.amount}`,
                html: this.getEmailTemplate(payment)
            });
        } catch (error) {
            console.error('Admin email failed:', error);
        }
    }

    async sendSMS(payment) {
        if (!this.twilioClient) return;

        try {
            await this.twilioClient.messages.create({
                body: `🚨 New ${payment.cryptoType} payment: ${payment.amount}\nStatus: ${payment.status}\nTx: ${payment.transactionId.slice(0, 8)}...`,
                to: process.env.ADMIN_PHONE,
                from: process.env.TWILIO_PHONE
            });
        } catch (error) {
            console.error('Admin SMS failed:', error);
        }
    }

    async sendSlackMessage(payment) {
        if (!this.slackClient) return;

        try {
            await this.slackClient.chat.postMessage({
                channel: process.env.SLACK_CHANNEL_ID,
                text: `New Crypto Payment Received!`,
                blocks: this.getSlackBlocks(payment)
            });
        } catch (error) {
            console.error('Slack notification failed:', error);
        }
    }

    getEmailTemplate(payment) {
        return `
            <h2>New Payment Received</h2>
            <p>Amount: ${payment.amount} ${payment.cryptoType}</p>
            <p>Transaction ID: ${payment.transactionId}</p>
            <p>Status: ${payment.status}</p>
            <p>Customer: ${payment.userId.firstName} ${payment.userId.lastName}</p>
            <p>Email: ${payment.userId.email}</p>
            <a href="${process.env.ADMIN_URL}/crypto-verify">View in Dashboard</a>
        `;
    }

    getSlackBlocks(payment) {
        return [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*New ${payment.cryptoType} Payment*\n${payment.amount}`
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Status:*\n${payment.status}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Customer:*\n${payment.userId.firstName} ${payment.userId.lastName}`
                    }
                ]
            }
        ];
    }
}

module.exports = new AdminNotifier(); 