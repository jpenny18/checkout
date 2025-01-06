const verifyPayment = async (payment) => {
    // Auto-approve if meets certain criteria
    if (
        payment.amount <= 5000 && // Small amounts
        payment.userId.previousPayments > 0 && // Returning customer
        !payment.userId.hasDisputes // No previous issues
    ) {
        return true;
    }

    // Auto-reject suspicious patterns
    if (
        payment.amount > 100000 || // Unusually large
        payment.userId.failedAttempts > 3 || // Multiple failed attempts
        isBlacklisted(payment.userId.email) // Known issues
    ) {
        return false;
    }

    // Manual review needed
    return null;
};

module.exports = { verifyPayment }; 