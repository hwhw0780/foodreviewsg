const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Restaurant = require('./Restaurant');

const PendingReview = sequelize.define('PendingReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Restaurant,
            key: 'id'
        }
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    tableName: 'PendingReviews',
    timestamps: true
});

// Define association with Restaurant
PendingReview.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Restaurant.hasMany(PendingReview, { foreignKey: 'restaurantId' });

module.exports = PendingReview; 