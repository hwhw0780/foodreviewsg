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
                if (!Array.isArray(value) || value.length !== 5) {
                    throw new Error('Must contain exactly 5 restaurants');
                }
                value.forEach((restaurant, index) => {
                    if (!restaurant.id || !restaurant.rank) {
                        throw new Error('Each restaurant must have an id and rank');
                    }
                    if (restaurant.rank !== index + 1) {
                        throw new Error('Ranks must be 1 through 5 in order');
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
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = TopList; 