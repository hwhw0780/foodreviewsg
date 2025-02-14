require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const restaurantRoutes = require('./routes/restaurants');
const statisticsRoutes = require('./routes/statistics');
const partnerRoutes = require('./routes/partnerRoutes');
const topListRoutes = require('./routes/topLists');
const TopList = require('./models/TopList');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Ensure uploads directory exists and serve it
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory at:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Ensure images directory exists and serve it
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}
app.use('/images', express.static(imagesDir));

// Add logging for image requests
app.use('/uploads', (req, res, next) => {
    console.log('Image request:', req.url);
    console.log('Full path:', path.join(uploadDir, req.url));
    console.log('File exists:', fs.existsSync(path.join(uploadDir, req.url)));
    next();
});

// Routes
app.get(['/', '/homepage'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Redirect /index.html to homepage
app.get('/index.html', (req, res) => {
    res.redirect(301, '/');
});

// Serve join page
app.get('/join.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'join.html'));
});

// Serve privacy policy page
app.get('/privacy-policy.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Serve dynamic Top 5 list pages
app.get('/top-5/:slug', async (req, res) => {
    try {
        // Always serve the page and let the client-side handle the data fetching and error display
        res.sendFile(path.join(__dirname, 'top-list.html'));
    } catch (error) {
        console.error('Error serving top-5 list page:', error);
        res.status(500).send('Server error');
    }
});

// Serve restaurant details page
app.get('/restaurant-details.html', (req, res) => {
    console.log('Serving restaurant details page, query params:', req.query);
    res.sendFile(path.join(__dirname, 'restaurant-details.html'));
});

// Admin routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/dashboard.html'));
});

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/top-lists', topListRoutes);
app.use('/api', partnerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Initialize database and start server
async function startServer() {
    try {
        // Test database connection
        await testConnection();
        
        // Sync database with alter option to safely update schema
        console.log('Syncing database with alter...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully with updated schema');

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer(); 