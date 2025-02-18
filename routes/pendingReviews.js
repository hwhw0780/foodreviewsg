const express = require('express');
const router = express.Router();
const PendingReview = require('../models/PendingReview');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// Get all pending reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await PendingReview.findAll({
            where: {
                status: 'pending'
            },
            include: [{
                model: Restaurant,
                attributes: ['name', 'nameChinese']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }
});

// Submit a new review
router.post('/', async (req, res) => {
    try {
        const { restaurantId, author, rating, comment } = req.body;

        // Validate required fields
        if (!restaurantId || !author || !rating || !comment) {
            return res.status(400).json({
                error: 'Restaurant ID, author, rating, and comment are required'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        }

        // Check if restaurant exists
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const review = await PendingReview.create({
            restaurantId,
            author,
            rating,
            comment,
            status: 'pending'
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating pending review:', error);
        res.status(400).json({
            error: 'Failed to create pending review',
            details: error.message
        });
    }
});

// Approve a review
router.post('/:id/approve', async (req, res) => {
    try {
        const review = await PendingReview.findByPk(req.params.id, {
            include: [Restaurant]
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.status !== 'pending') {
            return res.status(400).json({ error: 'Review is not pending' });
        }

        // Start a transaction
        const t = await PendingReview.sequelize.transaction();

        try {
            // Update the restaurant's reviews
            const restaurant = review.Restaurant;
            const currentReviews = restaurant.customReviews || [];
            const newReview = {
                author: review.author,
                rating: review.rating,
                comment: review.comment
            };

            // Calculate new rating
            const totalRatings = currentReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
            const newRating = totalRatings / (currentReviews.length + 1);

            await restaurant.update({
                customReviews: [...currentReviews, newReview],
                rating: parseFloat(newRating.toFixed(1)),
                reviewCount: currentReviews.length + 1
            }, { transaction: t });

            // Update review status
            await review.update({ status: 'approved' }, { transaction: t });

            await t.commit();
            res.json({ message: 'Review approved successfully' });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({ error: 'Failed to approve review' });
    }
});

// Reject a review
router.post('/:id/reject', async (req, res) => {
    try {
        const review = await PendingReview.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.status !== 'pending') {
            return res.status(400).json({ error: 'Review is not pending' });
        }

        await review.update({ status: 'rejected' });
        res.json({ message: 'Review rejected successfully' });
    } catch (error) {
        console.error('Error rejecting review:', error);
        res.status(500).json({ error: 'Failed to reject review' });
    }
});

module.exports = router; 