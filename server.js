require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure CORS
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight requests
app.options('*', cors());

// Add this middleware after your existing middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Content-Security-Policy', "frame-ancestors *");
    next();
});

// Serve the checkout page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thebestcheckout.html'));
});

// Add a specific handler for the HTML file
app.get('/thebestcheckout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thebestcheckout.html'));
});

// Handle user data collection
app.post('/collect-user-data', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            countryCode,
            country,
            platform,
            challengeType,
            challengeAmount
        } = req.body;
        
        console.log('User submission:', {
            timestamp: new Date(),
            customerName: `${firstName} ${lastName}`,
            email,
            phone: `${countryCode}${phone}`,
            country,
            platform,
            challengeType,
            challengeAmount
        });

        res.json({ success: true, message: 'Data collected successfully' });
    } catch (error) {
        console.error('Error collecting user data:', error);
        res.status(500).json({ error: 'Failed to collect user data' });
    }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thebestcheckout.html'));
});

// Start server if not being imported
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app; 