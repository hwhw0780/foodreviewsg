const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Restaurant = require('./Restaurant');

const TopList = sequelize.define('TopList', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    restaurants: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            isValidRestaurantArray(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Must be an array of restaurants');
                }
                if (value.length === 0) {
                    throw new Error('Must include at least one restaurant');
                }
                if (value.length > 5) {
                    throw new Error('Cannot include more than 5 restaurants');
                }
                value.forEach((restaurant, index) => {
                    if (!restaurant.id || !restaurant.rank) {
                        throw new Error('Each restaurant must have an id and rank');
                    }
                    if (restaurant.rank !== index + 1) {
                        throw new Error('Ranks must be sequential starting from 1');
                    }
                });
            }
        }
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    metaDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metaKeywords: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    restaurantSeoData: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidSeoData(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Restaurant SEO data must be an array');
                }
                value.forEach(seo => {
                    if (!seo.restaurantId || !seo.keywords || !seo.description) {
                        throw new Error('Each SEO entry must have restaurantId, keywords, and description');
                    }
                });
            }
        }
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = TopList; 