const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const path = require('path');

class CustomerNotifier {
    constructor() {
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendPaymentConfirmation(payment, user) {
        try {
            // Generate QR code for receipt
            const receiptQR = await QRCode.toDataURL(payment.transactionId);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Payment Confirmed - The Best Checkout',
                html: this.getConfirmationTemplate(payment, user, receiptQR),
                attachments: [{
                    filename: 'receipt.pdf',
                    content: await this.generateReceipt(payment, user)
                }]
            };

            await this.emailTransporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Customer notification failed:', error);
        }
    }

    getConfirmationTemplate(payment, user, qrCode) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f7c843;">Payment Received!</h1>
                <p>Dear ${user.firstName},</p>
                <p>Thank you for your payment. Here are your transaction details:</p>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Amount:</strong> ${payment.amount} ${payment.cryptoType}</p>
                    <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                    <p><strong>Status:</strong> ${payment.status}</p>
                    <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <img src="${qrCode}" alt="Transaction QR" style="width: 150px;">
                </div>

                <p>A detailed receipt is attached to this email.</p>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <small>This is an automated message, please do not reply directly to this email.</small>
                </div>
            </div>
        `;
    }

    async generateReceipt(payment, user) {
        // Implementation for PDF receipt generation
        // You'll need a PDF library like PDFKit
        // This is a placeholder
        return Buffer.from('Receipt content');
    }
}

module.exports = new CustomerNotifier(); 