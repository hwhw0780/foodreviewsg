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
    console.log('[Statistics] GET request received');
    try {
        let stats = await Statistics.findOne();
        console.log('[Statistics] Current stats from DB:', stats ? stats.toJSON() : 'No stats found');
        
        if (!stats) {
            console.log('[Statistics] No stats found, creating default stats');
            stats = await Statistics.create({});
            console.log('[Statistics] Created default stats:', stats.toJSON());
        }
        
        res.json(stats);
    } catch (error) {
        console.error('[Statistics] Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Update statistics
router.post('/', async (req, res) => {
    console.log('[Statistics] POST request received with body:', req.body);
    try {
        const { 'daily-users': dailyUsers, 'daily-bookings': dailyBookings, 
                'total-restaurants': totalRestaurants, 'total-reviews': totalReviews } = req.body;

        // Convert values to numbers and default to 0 if invalid
        const values = {
            dailyUsers: Number(dailyUsers) || 0,
            dailyBookings: Number(dailyBookings) || 0,
            totalRestaurants: Number(totalRestaurants) || 0,
            totalReviews: Number(totalReviews) || 0
        };

        console.log('[Statistics] Parsed values:', values);

        let stats = await Statistics.findOne();
        console.log('[Statistics] Current stats before update:', stats ? stats.toJSON() : 'No stats found');

        if (!stats) {
            console.log('[Statistics] Creating new statistics record');
            stats = await Statistics.create(values);
        } else {
            console.log('[Statistics] Updating existing statistics');
            stats = await stats.update(values, { returning: true });
        }

        const updatedStats = await Statistics.findOne();
        console.log('[Statistics] Final stats after update:', updatedStats.toJSON());
        res.json(updatedStats);
    } catch (error) {
        console.error('[Statistics] Error updating statistics:', error);
        res.status(500).json({ error: 'Failed to update statistics: ' + error.message });
    }
});

module.exports = router; 