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
        const id = parseInt(req.params.id);
        console.log('Fetching restaurant with ID:', id);
        
        if (isNaN(id)) {
            console.log('Invalid restaurant ID:', req.params.id);
            return res.status(400).json({ error: 'Invalid restaurant ID' });
        }

        const restaurant = await Restaurant.findByPk(id);
        console.log('Found restaurant:', restaurant);
        
        if (!restaurant) {
            console.log('Restaurant not found for ID:', id);
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Create new restaurant
router.post('/', upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'category', 'location', 'address', 'priceRange'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate priceRange
        const priceRange = parseInt(req.body.priceRange);
        if (isNaN(priceRange) || priceRange < 1 || priceRange > 4) {
            return res.status(400).json({
                error: 'Price range must be a number between 1 and 4'
            });
        }

        // Validate website if provided
        if (req.body.website && !req.body.website.match(/^https?:\/\/.+/)) {
            return res.status(400).json({
                error: 'Website must be a valid URL starting with http:// or https://'
            });
        }

        // Validate phone if provided
        if (req.body.phone && !req.body.phone.match(/^\+?[0-9\-\s()]+$/)) {
            return res.status(400).json({
                error: 'Phone number format is invalid'
            });
        }

        // Parse customReviews if it's a string
        let customReviews = [];
        if (req.body.customReviews) {
            try {
                customReviews = JSON.parse(req.body.customReviews);
                if (!Array.isArray(customReviews)) {
                    throw new Error('Reviews must be an array');
                }
            } catch (error) {
                return res.status(400).json({
                    error: 'Invalid customReviews format'
                });
            }
        }

        const restaurantData = {
            ...req.body,
            customReviews,
            bannerImage: req.files?.['bannerImage'] ? `/uploads/${req.files['bannerImage'][0].filename}` : null,
            photos: req.files?.['photos'] ? req.files['photos'].map(file => `/uploads/${file.filename}`) : []
        };

        console.log('Creating restaurant with data:', restaurantData);

        const restaurant = await Restaurant.create(restaurantData);
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('Restaurant creation error:', error);
        res.status(400).json({ 
            error: 'Failed to create restaurant',
            details: error.message,
            validationErrors: error.errors?.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
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

        // Prepare update data
        const updateData = {
            name: req.body.name,
            nameChinese: req.body.nameChinese,
            category: req.body.category,
            website: req.body.website,
            phone: req.body.phone,
            location: req.body.location,
            address: req.body.address,
            priceRange: req.body.priceRange,
            rating: req.body.rating,
            reviewCount: req.body.reviewCount,
            googleReviewUrl: req.body.googleReviewUrl,
            menuUrl: req.body.menuUrl,
            bookingUrl: req.body.bookingUrl,
            facebookUrl: req.body.facebookUrl,
            xhsUrl: req.body.xhsUrl
        };

        // Handle custom reviews
        if (req.body.customReviews) {
            try {
                updateData.customReviews = JSON.parse(req.body.customReviews);
            } catch (error) {
                console.error('Error parsing customReviews:', error);
                updateData.customReviews = [];
            }
        }

        // Handle banner image if new one is uploaded
        if (req.files?.['bannerImage']) {
            updateData.bannerImage = `/uploads/${req.files['bannerImage'][0].filename}`;
        }

        // Handle photos if new ones are uploaded
        if (req.files?.['photos']) {
            updateData.photos = req.files['photos'].map(file => `/uploads/${file.filename}`);
        }

        console.log('Updating restaurant with data:', updateData);

        // Update the restaurant
        await restaurant.update(updateData);
        
        // Fetch the updated restaurant to return
        const updatedRestaurant = await Restaurant.findByPk(req.params.id);
        res.json(updatedRestaurant);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ 
            error: 'Failed to update restaurant',
            details: error.message,
            validationErrors: error.errors?.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
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