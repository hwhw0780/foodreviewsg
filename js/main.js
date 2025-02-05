document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const categoryButtons = document.querySelectorAll('.category-btn');
    const locationSelect = document.getElementById('location-select');
    const restaurantCards = document.querySelectorAll('.restaurant-card');
    const featuredTitle = document.getElementById('featured-title');

    // Current filter state
    let currentCategory = 'all';
    let currentLocation = 'all';

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

    // Update featured title based on category
    function updateTitle(category) {
        const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
        if (category === 'all') {
            featuredTitle.textContent = 'Featured Restaurants';
        } else {
            featuredTitle.textContent = `Top 5 ${categoryName} Restaurants`;
        }
    }

    // Filter restaurants based on category and location
    function filterRestaurants() {
        let visibleCount = 0;
        const maxVisible = currentCategory === 'all' ? Infinity : 5;

        restaurantCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardLocation = card.dataset.location;
            
            const categoryMatch = currentCategory === 'all' || cardCategory === currentCategory;
            const locationMatch = currentLocation === 'all' || cardLocation === currentLocation;

            if (categoryMatch && locationMatch && visibleCount < maxVisible) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show "no results" message if no restaurants are visible
        const noResultsMessage = document.getElementById('no-results-message');
        if (visibleCount === 0) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.id = 'no-results-message';
                message.className = 'no-results';
                message.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No restaurants found for this category in ${currentLocation === 'all' ? 'Singapore' : currentLocation.replace('-', ' ')}.</p>
                `;
                document.querySelector('.restaurant-grid').appendChild(message);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }

    // Category button click handler
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current category and filter
            currentCategory = button.getAttribute('data-category');
            updateTitle(currentCategory);
            filterRestaurants();
        });
    });

    // Location select change handler
    locationSelect.addEventListener('change', () => {
        currentLocation = locationSelect.value;
        filterRestaurants();
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        restaurantCards.forEach(card => {
            const restaurantName = card.querySelector('h3').textContent.toLowerCase();
            const cuisine = card.querySelector('.cuisine').textContent.toLowerCase();
            const location = card.querySelector('.location').textContent.toLowerCase();

            if (restaurantName.includes(searchTerm) || 
                cuisine.includes(searchTerm) || 
                location.includes(searchTerm)) {
                if (!card.classList.contains('hidden')) {
                    card.style.display = 'block';
                }
            } else {
                card.style.display = 'none';
            }
        });
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

    // Example of how to update statistics (this will be called from admin dashboard)
    // window.updateStatistics({
    //     'daily-users': 16000,
    //     'daily-bookings': 2600,
    //     'total-restaurants': 1950,
    //     'total-reviews': 46000
    // });
}); 