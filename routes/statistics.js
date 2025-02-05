const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

// Create Statistics model
const Statistics = sequelize.define('Statistics', {
    dailyUsers: {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0
    },
    dailyBookings: {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0
    },
    totalRestaurants: {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0
    },
    totalReviews: {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0
    }
});

// Get current statistics
router.get('/', async (req, res) => {
    try {
        let stats = await Statistics.findOne();
        if (!stats) {
            stats = await Statistics.create({});
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Update statistics
router.post('/', async (req, res) => {
    try {
        const { 'daily-users': dailyUsers, 'daily-bookings': dailyBookings, 
                'total-restaurants': totalRestaurants, 'total-reviews': totalReviews } = req.body;

        let stats = await Statistics.findOne();
        if (!stats) {
            stats = await Statistics.create({
                dailyUsers,
                dailyBookings,
                totalRestaurants,
                totalReviews
            });
        } else {
            await stats.update({
                dailyUsers,
                dailyBookings,
                totalRestaurants,
                totalReviews
            });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update statistics' });
    }
});

module.exports = router; 