const { check, validationResult } = require('express-validator');

const cryptoPaymentValidation = [
    check('userId').notEmpty().isMongoId().withMessage('Valid user ID required'),
    check('amount').notEmpty().isString().withMessage('Amount is required'),
    check('cryptoType').isIn(['BTC', 'ETH', 'USDT']).withMessage('Invalid crypto type'),
    check('transactionId').notEmpty().isString().withMessage('Transaction ID required'),
    check('screenshot').optional().isURL().withMessage('Invalid screenshot URL')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};

module.exports = { cryptoPaymentValidation, validate }; 