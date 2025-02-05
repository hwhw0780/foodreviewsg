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

        // Create a test restaurant
        const testRestaurant = await Restaurant.create({
            name: "Din Tai Fung",
            nameChinese: "鼎泰丰",
            category: "chinese",
            location: "orchard",
            address: "435 Orchard Road, Wisma Atria #04-22, Singapore 238877",
            imageUrl: "https://example.com/din-tai-fung.jpg",
            priceRange: 2,
            rating: 4.5,
            reviewCount: 1234
        });

        console.log('Test restaurant created:', testRestaurant.toJSON());

        // Query the restaurant back
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