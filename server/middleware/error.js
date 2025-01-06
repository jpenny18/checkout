const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: 'Something went wrong! Please try again.'
    });
};

module.exports = errorHandler; 