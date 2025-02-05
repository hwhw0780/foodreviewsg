const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Restaurant = require('../models/Restaurant');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll();
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurant' });
    }
});

// Create new restaurant
router.post('/', upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), async (req, res) => {
    try {
        const restaurantData = {
            ...req.body,
            bannerImage: req.files['bannerImage'] ? `/uploads/${req.files['bannerImage'][0].filename}` : null,
            photos: req.files['photos'] ? req.files['photos'].map(file => `/uploads/${file.filename}`) : []
        };

        const restaurant = await Restaurant.create(restaurantData);
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create restaurant: ' + error.message });
    }
});

// Update restaurant
router.put('/:id', upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const updateData = {
            ...req.body
        };

        if (req.files['bannerImage']) {
            updateData.bannerImage = `/uploads/${req.files['bannerImage'][0].filename}`;
        }
        if (req.files['photos']) {
            updateData.photos = req.files['photos'].map(file => `/uploads/${file.filename}`);
        }

        await restaurant.update(updateData);
        res.json(restaurant);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update restaurant' });
    }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        await restaurant.destroy();
        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete restaurant' });
    }
});

module.exports = router; 