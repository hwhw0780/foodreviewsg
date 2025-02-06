const express = require('express');
const router = express.Router();
const TopList = require('../models/TopList');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// Create a new Top 5 list
router.post('/', async (req, res) => {
    try {
        const { category, location, restaurants } = req.body;
        
        // Generate slug
        const slug = `top-5-${category.toLowerCase()}-${location.toLowerCase()}`.replace(/\s+/g, '-');
        
        // Generate meta title and description
        const metaTitle = `Top 5 ${category} Restaurants in ${location}, Singapore`;
        const metaDescription = `Discover the best ${category} restaurants in ${location}, Singapore. Our carefully curated list of the top 5 ${category.toLowerCase()} dining spots in ${location}.`;

        const topList = await TopList.create({
            category,
            location,
            slug,
            restaurants,
            metaTitle,
            metaDescription
        });

        res.status(201).json(topList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all Top 5 lists
router.get('/', async (req, res) => {
    try {
        const lists = await TopList.findAll({
            order: [['lastUpdated', 'DESC']]
        });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Top 5 list by slug
router.get('/:slug', async (req, res) => {
    try {
        const list = await TopList.findOne({
            where: { slug: req.params.slug }
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Fetch full restaurant details
        const restaurantIds = list.restaurants.map(r => r.id);
        const restaurants = await Restaurant.findAll({
            where: { id: { [Op.in]: restaurantIds } }
        });

        // Merge restaurant details with rankings
        const fullList = {
            ...list.toJSON(),
            restaurants: list.restaurants.map(rankItem => ({
                ...restaurants.find(r => r.id === rankItem.id)?.toJSON(),
                rank: rankItem.rank
            }))
        };

        res.json(fullList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Top 5 list
router.put('/:id', async (req, res) => {
    try {
        const list = await TopList.findByPk(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const { category, location, restaurants } = req.body;
        const updates = {
            category,
            location,
            restaurants,
            lastUpdated: new Date()
        };

        await list.update(updates);
        res.json(list);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a Top 5 list
router.delete('/:id', async (req, res) => {
    try {
        const list = await TopList.findByPk(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        await list.destroy();
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 