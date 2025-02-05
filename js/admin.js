document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!sessionStorage.getItem('adminLoggedIn') && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }

    // Login form handling
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple authentication (replace with proper backend authentication)
            if (username === 'admin' && password === 'admin123') {
                sessionStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                const errorMessage = document.getElementById('error-message');
                errorMessage.textContent = 'Invalid username or password';
            }
        });
    }

    // Statistics update handling
    const updateStatsBtn = document.getElementById('update-stats-btn');
    if (updateStatsBtn) {
        updateStatsBtn.addEventListener('click', function() {
            const stats = {
                'daily-users': parseInt(document.getElementById('daily-users-input').value),
                'daily-bookings': parseInt(document.getElementById('daily-bookings-input').value),
                'total-restaurants': parseInt(document.getElementById('total-restaurants-input').value),
                'total-reviews': parseInt(document.getElementById('total-reviews-input').value)
            };

            // Update statistics on the main page
            if (window.opener && !window.opener.closed) {
                window.opener.updateStatistics(stats);
            }

            // Show success message
            showMessage('Statistics updated successfully!', 'success');
        });
    }

    // Restaurant form handling
    const addRestaurantForm = document.getElementById('add-restaurant-form');
    if (addRestaurantForm) {
        addRestaurantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const restaurantData = {
                name: document.getElementById('restaurant-name').value,
                nameChinese: document.getElementById('restaurant-name-chinese').value,
                category: document.getElementById('restaurant-category').value,
                location: document.getElementById('restaurant-location').value,
                address: document.getElementById('restaurant-address').value,
                image: document.getElementById('restaurant-image').value,
                priceRange: document.getElementById('price-range').value
            };

            // Store restaurant data (replace with backend API call)
            let restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
            restaurants.push(restaurantData);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));

            // Show success message
            showMessage('Restaurant added successfully!', 'success');
            addRestaurantForm.reset();
        });
    }

    // Helper function to show messages
    function showMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        const container = document.querySelector('.admin-container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}); 