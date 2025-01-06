require('dotenv').config();
const express = require('express');
const connectDB = require('./server/config/db');
const apiRoutes = require('./server/routes/api');
const errorHandler = require('./server/middleware/error');
const adminRoutes = require('./server/routes/admin');
require('./server/utils/scheduler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Add this after your routes
app.use(errorHandler);

// Add this after your routes
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        error: 'Server error occurred'
    });
});

// Add this right after dotenv config
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Is set' : 'Not set');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 