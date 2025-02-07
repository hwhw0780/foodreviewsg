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

// Get Top 5 list by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid list ID. ID must be a number.' });
        }

        const list = await TopList.findByPk(id);
        
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
        console.error('Error fetching Top 5 list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Top 5 list by slug
router.get('/slug/:slug', async (req, res) => {
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
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid list ID. ID must be a number.' });
        }

        const list = await TopList.findByPk(id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const { category, location, restaurants } = req.body;

        // Validate required fields
        if (!category || !location || !restaurants) {
            return res.status(400).json({ error: 'Category, location, and restaurants are required' });
        }

        // Validate restaurants array
        if (!Array.isArray(restaurants) || restaurants.length === 0) {
            return res.status(400).json({ error: 'At least one restaurant is required' });
        }

        // Update slug if category or location changed
        let updates = {
            category,
            location,
            restaurants,
            lastUpdated: new Date()
        };

        if (category !== list.category || location !== list.location) {
            updates.slug = `top-5-${category.toLowerCase()}-${location.toLowerCase()}`.replace(/\s+/g, '-');
            updates.metaTitle = `Top 5 ${category} Restaurants in ${location}, Singapore`;
            updates.metaDescription = `Discover the best ${category} restaurants in ${location}, Singapore. Our carefully curated list of the top 5 ${category.toLowerCase()} dining spots in ${location}.`;
        }

        await list.update(updates);
        res.json(list);
    } catch (error) {
        console.error('Error updating Top 5 list:', error);
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