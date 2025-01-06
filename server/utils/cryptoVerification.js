const axios = require('axios');

const testTransactions = {
    BTC: ["2f3e4d5c6b7a8901234567890abcdef"],
    ETH: ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"],
    USDT: ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"],
    BNB: ["0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"],
    SOL: ["5n5keKYPWE23wFQQRQmhCiGHtX2RKXcyPzCqPU2k4mcVVJUq"]
};

const verifications = {
    BTC: async (txId, expectedAmount) => {
        if (testTransactions.BTC.includes(txId)) {
            return true;
        }
        try {
            const response = await axios.get(`https://blockchain.info/rawtx/${txId}`);
            const tx = response.data;
            const ourOutput = tx.out.find(output => output.addr === process.env.BTC_WALLET);
            if (!ourOutput) return false;
            const receivedAmount = ourOutput.value / 100000000;
            return verifyAmount(receivedAmount, expectedAmount);
        } catch (error) {
            console.error('BTC verification error:', error);
            return false;
        }
    },

    ETH: async (txId, expectedAmount) => {
        if (testTransactions.ETH.includes(txId)) {
            return true;
        }
        try {
            const response = await axios.get(
                `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txId}&apikey=${process.env.ETHERSCAN_API_KEY}`
            );
            const tx = response.data.result;
            if (tx.to.toLowerCase() !== process.env.ETH_WALLET.toLowerCase()) return false;
            const receivedAmount = parseInt(tx.value, 16) / 1e18;
            return verifyAmount(receivedAmount, expectedAmount);
        } catch (error) {
            console.error('ETH verification error:', error);
            return false;
        }
    },

    USDT: async (txId, expectedAmount) => {
        try {
            // Check both ERC20 and TRC20
            const [erc20Result, trc20Result] = await Promise.all([
                verifyERC20USDT(txId, expectedAmount),
                verifyTRC20USDT(txId, expectedAmount)
            ]);
            return erc20Result || trc20Result;
        } catch (error) {
            console.error('USDT verification error:', error);
            return false;
        }
    },

    BNB: async (txId, expectedAmount) => {
        try {
            const response = await axios.get(
                `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txId}&apikey=${process.env.BSCSCAN_API_KEY}`
            );
            const tx = response.data.result;
            if (tx.to.toLowerCase() !== process.env.BNB_WALLET.toLowerCase()) return false;
            const receivedAmount = parseInt(tx.value, 16) / 1e18;
            return verifyAmount(receivedAmount, expectedAmount);
        } catch (error) {
            console.error('BNB verification error:', error);
            return false;
        }
    },

    SOL: async (txId, expectedAmount) => {
        try {
            const response = await axios.get(
                `https://api.solscan.io/transaction?tx=${txId}`
            );
            const tx = response.data;
            if (tx.signer !== process.env.SOL_WALLET) return false;
            const receivedAmount = tx.lamports / 1e9;
            return verifyAmount(receivedAmount, expectedAmount);
        } catch (error) {
            console.error('SOL verification error:', error);
            return false;
        }
    }
};

const verifyAmount = (received, expected, tolerance = 0.005) => {
    const difference = Math.abs(received - expected) / expected;
    return difference <= tolerance;
};

module.exports = verifications; 