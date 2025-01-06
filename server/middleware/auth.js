const authAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }
    
    next();
};

module.exports = { authAdmin }; 