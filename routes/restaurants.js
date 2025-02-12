const express = require('express');
const router = express.Router();
const multer = require('multer');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            order: [
                [sequelize.literal(`CASE 
                    WHEN "adStatus" = 'gold' THEN 1
                    WHEN "adStatus" = 'none' THEN 2
                    WHEN "adStatus" = 'silver' THEN 3
                END`), 'ASC'],
                ['rating', 'DESC']
            ]
        });

        // Filter out expired ads
        restaurants.forEach(restaurant => {
            if (restaurant.adExpiryDate && new Date(restaurant.adExpiryDate) < new Date()) {
                restaurant.adStatus = 'none';
                restaurant.adExpiryDate = null;
            }
        });

        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
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

        // Upload images to S3
        let bannerImageUrl = null;
        let photoUrls = [];

        if (req.files?.['bannerImage']) {
            bannerImageUrl = await uploadToS3(req.files['bannerImage'][0], 'banners');
        }

        if (req.files?.['photos']) {
            photoUrls = await Promise.all(
                req.files['photos'].map(photo => uploadToS3(photo, 'photos'))
            );
        }

        const restaurantData = {
            ...req.body,
            customReviews: req.body.customReviews ? JSON.parse(req.body.customReviews) : [],
            bannerImage: bannerImageUrl,
            photos: photoUrls
        };

        console.log('Creating restaurant with data:', restaurantData);

        const restaurant = await Restaurant.create(restaurantData);
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('Restaurant creation error:', error);
        res.status(400).json({ 
            error: 'Failed to create restaurant',
            details: error.message
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

        // Handle banner image
        if (req.files?.['bannerImage']) {
            // Upload new banner image
            updateData.bannerImage = await uploadToS3(req.files['bannerImage'][0], 'banners');
            
            // Delete old banner image if exists
            if (restaurant.bannerImage) {
                const key = restaurant.bannerImage.split('/').pop();
                await deleteFromS3(`banners/${key}`);
            }
        } else if (!req.body.keepExistingBanner) {
            // Delete old banner image if exists
            if (restaurant.bannerImage) {
                const key = restaurant.bannerImage.split('/').pop();
                await deleteFromS3(`banners/${key}`);
            }
            updateData.bannerImage = null;
        }

        // Handle photos
        if (req.files?.['photos']) {
            // Upload new photos
            updateData.photos = await Promise.all(
                req.files['photos'].map(photo => uploadToS3(photo, 'photos'))
            );
            
            // Delete old photos
            if (restaurant.photos && Array.isArray(restaurant.photos)) {
                await Promise.all(restaurant.photos.map(async (photo) => {
                    const key = photo.split('/').pop();
                    await deleteFromS3(`photos/${key}`);
                }));
            }
        } else if (!req.body.keepExistingPhotos) {
            // Delete old photos
            if (restaurant.photos && Array.isArray(restaurant.photos)) {
                await Promise.all(restaurant.photos.map(async (photo) => {
                    const key = photo.split('/').pop();
                    await deleteFromS3(`photos/${key}`);
                }));
            }
            updateData.photos = [];
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
            details: error.message
        });
    }
});

// Update ad status
router.put('/:id/ad-status', async (req, res) => {
    try {
        const { status } = req.body;
        const restaurant = await Restaurant.findByPk(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Validate status
        if (!['none', 'gold', 'silver'].includes(status)) {
            return res.status(400).json({ error: 'Invalid ad status' });
        }

        // Update restaurant
        await restaurant.update({
            adStatus: status,
            adExpiryDate: null // Remove expiry date as it's no longer needed
        });

        res.json(restaurant);
    } catch (error) {
        console.error('Error updating ad status:', error);
        res.status(500).json({ error: 'Failed to update ad status' });
    }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Delete images from S3
        if (restaurant.bannerImage) {
            const key = restaurant.bannerImage.split('/').pop();
            await deleteFromS3(`banners/${key}`);
        }

        if (restaurant.photos && Array.isArray(restaurant.photos)) {
            await Promise.all(restaurant.photos.map(async (photo) => {
                const key = photo.split('/').pop();
                await deleteFromS3(`photos/${key}`);
            }));
        }

        await restaurant.destroy();
        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete restaurant' });
    }
});

module.exports = router; 