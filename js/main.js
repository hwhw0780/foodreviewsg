document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const categoryButtons = document.querySelectorAll('.category-btn');
    const locationSelect = document.getElementById('location-select');
    const restaurantGrid = document.querySelector('.restaurant-grid');
    const featuredTitle = document.getElementById('featured-title');

    // Current filter state
    let currentCategory = 'all';
    let currentLocation = 'all';
    let restaurants = [];

    // Category names mapping (English to display name)
    const categoryNames = {
        'all': 'Featured',
        'chinese': 'Chinese (中餐)',
        'chicken-rice': 'Chicken Rice (海南鸡饭)',
        'dim-sum': 'Dim Sum (点心)',
        'malay': 'Malay',
        'indian': 'Indian',
        'local': 'Local (本地)',
        'japanese': 'Japanese (日本料理)',
        'korean': 'Korean (韩国料理)',
        'western': 'Western (西餐)',
        'hotpot': 'Hotpot (火锅)',
        'seafood': 'Seafood (海鲜)',
        'dessert': 'Dessert (甜点)',
        'ice-cream': 'Ice Cream (冰淇淋)',
        'cafe': 'Café (咖啡馆)',
        'bubble-tea': 'Bubble Tea (珍珠奶茶)',
        'bakery': 'Bakery (面包店)',
        'vegetarian': 'Vegetarian (素食)'
    };

    // Fetch restaurants from API
    async function fetchRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            if (!response.ok) {
                throw new Error('Failed to fetch restaurants');
            }
            restaurants = await response.json();
            displayRestaurants();
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            showNoResults('Failed to load restaurants. Please try again later.');
        }
    }

    // Create restaurant card HTML
    function createRestaurantCard(restaurant) {
        const priceSymbols = '$'.repeat(restaurant.priceRange);
        return `
            <div class="restaurant-card" data-category="${restaurant.category}" data-location="${restaurant.location.toLowerCase()}">
                <div class="restaurant-image">
                    <img src="${restaurant.bannerImage}" alt="${restaurant.name}">
                </div>
                <div class="restaurant-info">
                    <h3>${restaurant.name}${restaurant.nameChinese ? ` (${restaurant.nameChinese})` : ''}</h3>
                    <p class="cuisine">${categoryNames[restaurant.category] || restaurant.category}</p>
                    <div class="rating">
                        ${getRatingStars(restaurant.rating)}
                        <span>(${restaurant.reviewCount} reviews)</span>
                    </div>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${restaurant.location}</p>
                    <p class="price-range"><i class="fas fa-dollar-sign"></i>${priceSymbols}</p>
                </div>
            </div>
        `;
    }

    // Generate rating stars HTML
    function getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return `
            ${`<i class="fas fa-star"></i>`.repeat(fullStars)}
            ${hasHalfStar ? `<i class="fas fa-star-half-alt"></i>` : ''}
            ${`<i class="far fa-star"></i>`.repeat(emptyStars)}
        `;
    }

    // Display filtered restaurants
    function displayRestaurants() {
        restaurantGrid.innerHTML = '';
        let visibleCount = 0;
        const maxVisible = currentCategory === 'all' ? Infinity : 5;

        const filteredRestaurants = restaurants.filter(restaurant => {
            const categoryMatch = currentCategory === 'all' || restaurant.category === currentCategory;
            const locationMatch = currentLocation === 'all' || 
                                restaurant.location.toLowerCase() === currentLocation.toLowerCase();
            return categoryMatch && locationMatch;
        });

        if (filteredRestaurants.length === 0) {
            showNoResults();
            return;
        }

        filteredRestaurants.slice(0, maxVisible).forEach(restaurant => {
            restaurantGrid.innerHTML += createRestaurantCard(restaurant);
            visibleCount++;
        });

        updateTitle(currentCategory, visibleCount);
    }

    // Show no results message
    function showNoResults(message = null) {
        const defaultMessage = `No restaurants found for this category in ${
            currentLocation === 'all' ? 'Singapore' : currentLocation.replace('-', ' ')
        }.`;
        
        restaurantGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>${message || defaultMessage}</p>
            </div>
        `;
    }

    // Update title based on category and count
    function updateTitle(category, count) {
        const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
        if (category === 'all') {
            featuredTitle.textContent = 'Featured Restaurants';
        } else {
            featuredTitle.textContent = `Top ${count} ${categoryName} Restaurants`;
        }
    }

    // Category button click handler
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.getAttribute('data-category');
            displayRestaurants();
        });
    });

    // Location select change handler
    locationSelect.addEventListener('change', () => {
        currentLocation = locationSelect.value;
        displayRestaurants();
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        const filteredRestaurants = restaurants.filter(restaurant => {
            return restaurant.name.toLowerCase().includes(searchTerm) ||
                   (restaurant.nameChinese && restaurant.nameChinese.toLowerCase().includes(searchTerm)) ||
                   restaurant.category.toLowerCase().includes(searchTerm) ||
                   restaurant.location.toLowerCase().includes(searchTerm);
        });

        restaurantGrid.innerHTML = '';
        if (filteredRestaurants.length === 0) {
            showNoResults(`No restaurants found matching "${searchTerm}"`);
        } else {
            filteredRestaurants.forEach(restaurant => {
                restaurantGrid.innerHTML += createRestaurantCard(restaurant);
            });
        }
    }

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Statistics Animation
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Animate statistics when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statElements = document.querySelectorAll('.stat-number');
                statElements.forEach(stat => {
                    const finalValue = parseInt(stat.textContent.replace(/,/g, ''));
                    animateValue(stat, 0, finalValue, 2000);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const statsSection = document.querySelector('.statistics');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Function to update statistics (will be used by admin dashboard)
    window.updateStatistics = function(stats) {
        const elements = {
            'daily-users': document.getElementById('daily-users'),
            'daily-bookings': document.getElementById('daily-bookings'),
            'total-restaurants': document.getElementById('total-restaurants'),
            'total-reviews': document.getElementById('total-reviews')
        };

        for (const [key, value] of Object.entries(stats)) {
            const element = elements[key];
            if (element) {
                const currentValue = parseInt(element.textContent.replace(/,/g, ''));
                animateValue(element, currentValue, value, 1000);
            }
        }
    };

    // Initial fetch of restaurants
    fetchRestaurants();
}); 