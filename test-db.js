require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const Restaurant = require('./models/Restaurant');

async function testDatabase() {
    try {
        // Test connection
        await testConnection();

        // Sync database (create tables)
        await sequelize.sync({ force: false });
        console.log('Database synced successfully');

        // Query all restaurants
        const restaurants = await Restaurant.findAll();
        console.log('All restaurants:', restaurants.map(r => r.toJSON()));

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Close the connection
        await sequelize.close();
    }
}

testDatabase(); 