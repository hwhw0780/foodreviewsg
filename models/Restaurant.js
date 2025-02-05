const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    nameChinese: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    website: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    bannerImage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^\+?[0-9\-\s()]+$/
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priceRange: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 4
        }
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    googleReviewUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    menuUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    bookingUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    facebookUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    xhsUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    customReviews: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidReviewArray(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Reviews must be an array');
                }
                if (value.length > 0) {
                    value.forEach(review => {
                        if (!review.author || !review.rating || !review.comment) {
                            throw new Error('Each review must have author, rating, and comment');
                        }
                        if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
                            throw new Error('Rating must be a number between 1 and 5');
                        }
                    });
                }
            }
        }
    }
}, {
    tableName: 'Restaurants',
    timestamps: true
});

module.exports = Restaurant; 