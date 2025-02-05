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
        allowNull: false
    },
    nameChinese: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: true,
        comment: '16:9 aspect ratio banner image'
    },
    photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        comment: '1:1 aspect ratio photos'
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
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
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
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Restaurants',
    timestamps: true
});

module.exports = Restaurant; 