const fetch = require('node-fetch');

const sendDiscordNotification = async (payment) => {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    const embed = {
        title: "New Crypto Payment Pending",
        color: 0xf7c843,
        fields: [
            {
                name: "Amount",
                value: `${payment.amount} ${payment.cryptoType}`,
                inline: true
            },
            {
                name: "Transaction ID",
                value: payment.transactionId,
                inline: true
            }
        ],
        timestamp: new Date(),
        footer: {
            text: "Click to verify payment"
        }
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Discord notification failed:', error);
    }
};

module.exports = { sendDiscordNotification }; 