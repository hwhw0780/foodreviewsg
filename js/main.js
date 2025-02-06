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
            console.log('=== Fetching Restaurants ===');
            const response = await fetch('/api/restaurants');
            console.log('API Response:', response);
            
            if (!response.ok) {
                throw new Error('Failed to fetch restaurants');
            }
            
            restaurants = await response.json();
            console.log('Fetched restaurants:', restaurants);
            
            if (!restaurants || restaurants.length === 0) {
                console.log('No restaurants found in response');
                showNoResults('No restaurants available.');
                return;
            }

            // Validate restaurant data
            restaurants.forEach((restaurant, index) => {
                if (!restaurant.id) {
                    console.warn(`Restaurant at index ${index} is missing ID:`, restaurant);
                }
            });

            displayRestaurants();
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            showNoResults('Failed to load restaurants. Please try again later.');
        }
    }

    // Create restaurant card HTML
    function createRestaurantCard(restaurant) {
        console.log('Creating card for restaurant:', restaurant);
        const stars = '★'.repeat(Math.floor(restaurant.rating)) + 
                     (restaurant.rating % 1 >= 0.5 ? '½' : '') +
                     '☆'.repeat(5 - Math.ceil(restaurant.rating));
        
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.setAttribute('data-restaurant-id', restaurant.id);
        
        // Add click event listener
        card.addEventListener('click', function(e) {
            console.log('=== Card Click Event ===');
            console.log('Event:', e);
            console.log('Clicked restaurant ID:', restaurant.id);
            console.log('Restaurant data:', restaurant);
            e.preventDefault();
            try {
                showRestaurantModal(restaurant);
            } catch (error) {
                console.error('Error showing modal:', error);
            }
        });
        
        // Update image handling to use absolute paths
        const bannerImageUrl = restaurant.bannerImage?.startsWith('/') ? restaurant.bannerImage : `/${restaurant.bannerImage}`;
        console.log('Banner image URL:', bannerImageUrl);
        
        // Create price range string with correct number of dollar signs
        const priceRangeStr = '$'.repeat(parseInt(restaurant.priceRange) || 1);
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${bannerImageUrl || ''}" alt="${restaurant.name}" 
                     onerror="this.onerror=null; this.src='/images/default-restaurant.jpg';">
            </div>
            <div class="card-content">
                <h3>${restaurant.name}</h3>
                <div class="restaurant-info">
                    <span class="category">${restaurant.category}</span>
                    <span class="separator">•</span>
                    <span class="location">${restaurant.location}</span>
                </div>
                <div class="rating-price">
                    <div class="rating">
                        <span class="stars">${stars}</span>
                        <span class="review-count">(${restaurant.reviewCount} reviews)</span>
                    </div>
                    <div class="price-range">${priceRangeStr}</div>
                </div>
            </div>
        `;
        
        console.log('Card HTML created:', card.outerHTML);
        return card;
    }

    // Function to show restaurant modal
    function showRestaurantModal(restaurant) {
        console.log('=== Showing Modal ===');
        console.log('Creating modal for restaurant:', restaurant);
        
        const modal = document.createElement('div');
        modal.className = 'restaurant-modal';
        
        const stars = '★'.repeat(Math.floor(restaurant.rating)) + 
                     (restaurant.rating % 1 >= 0.5 ? '½' : '') +
                     '☆'.repeat(5 - Math.ceil(restaurant.rating));
        
        // Create price range string with correct number of dollar signs
        const priceRangeStr = '$'.repeat(parseInt(restaurant.priceRange) || 1);
        
        console.log('Building modal HTML...');
        
        const modalHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-header">
                    <img src="${restaurant.bannerImage || '/images/default-restaurant.jpg'}" 
                         alt="${restaurant.name}" class="modal-banner">
                    <div class="modal-title">
                        <h2>${restaurant.name}</h2>
                        ${restaurant.nameChinese ? `<p class="chinese-name">${restaurant.nameChinese}</p>` : ''}
                    </div>
                </div>
                <div class="modal-body">
                    <h1 class="restaurant-title">${restaurant.name}</h1>
                    ${restaurant.nameChinese ? `<h2 class="restaurant-chinese-name">${restaurant.nameChinese}</h2>` : ''}
                    
                    <div class="restaurant-info">
                        <div class="info-row">
                            <span class="category">${restaurant.category}</span>
                            <span class="separator">•</span>
                            <span class="location">${restaurant.location}</span>
                            <span class="separator">•</span>
                            <span class="price-range">${priceRangeStr}</span>
                        </div>
                        <div class="info-row">
                            <div class="rating">
                                <span class="stars">${stars}</span>
                                <span class="review-count">(${restaurant.reviewCount} reviews)</span>
                            </div>
                        </div>
                        ${restaurant.address ? `
                            <div class="info-row">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${restaurant.address}</span>
                            </div>
                        ` : ''}
                        ${restaurant.phone ? `
                            <div class="info-row">
                                <i class="fas fa-phone"></i>
                                <a href="tel:${restaurant.phone}">${restaurant.phone}</a>
                            </div>
                        ` : ''}
                        ${restaurant.website ? `
                            <div class="info-row">
                                <i class="fas fa-globe"></i>
                                <a href="${restaurant.website}" target="_blank">Visit Website</a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="action-buttons">
                        ${restaurant.menuUrl ? `
                            <a href="${restaurant.menuUrl}" target="_blank" class="action-btn menu-btn">
                                <i class="fas fa-utensils"></i> View Menu
                            </a>
                        ` : ''}
                        ${restaurant.bookingUrl ? `
                            <a href="${restaurant.bookingUrl}" target="_blank" class="action-btn booking-btn">
                                <i class="fas fa-calendar-alt"></i> Book a Table
                            </a>
                        ` : ''}
                        ${restaurant.googleReviewUrl ? `
                            <a href="${restaurant.googleReviewUrl}" target="_blank" class="action-btn google-btn">
                                <i class="fab fa-google"></i> Google Reviews
                            </a>
                        ` : ''}
                        ${restaurant.facebookUrl ? `
                            <a href="${restaurant.facebookUrl}" target="_blank" class="action-btn facebook-btn">
                                <i class="fab fa-facebook"></i>
                            </a>
                        ` : ''}
                        ${restaurant.xhsUrl ? `
                            <a href="${restaurant.xhsUrl}" target="_blank" class="action-btn xhs-btn">
                                <img src="/images/xhs-icon.png" alt="XHS" class="xhs-icon">
                            </a>
                        ` : ''}
                    </div>

                    ${restaurant.photos && restaurant.photos.length > 0 ? `
                        <div class="photos-section">
                            <h3>Photos</h3>
                            <div class="photos-grid">
                                ${restaurant.photos.map(photo => `
                                    <div class="photo-item">
                                        <img src="${photo}" alt="${restaurant.name}" 
                                             onclick="window.open('${photo}', '_blank')">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${restaurant.customReviews && restaurant.customReviews.length > 0 ? `
                        <div class="reviews-section">
                            <h3>Customer Reviews</h3>
                            <div class="reviews-container">
                                ${restaurant.customReviews.map(review => `
                                    <div class="review-card">
                                        <div class="review-header">
                                            <span class="reviewer-name">${review.author}</span>
                                            <span class="review-rating">
                                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                            </span>
                                        </div>
                                        <p class="review-comment">${review.comment}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        console.log('Modal HTML built');
        modal.innerHTML = modalHTML;
        console.log('Modal HTML set');

        console.log('Appending modal to body...');
        document.body.appendChild(modal);
        console.log('Modal appended to body');

        // Close modal when clicking the close button or outside the modal
        const closeBtn = modal.querySelector('.close-modal');
        console.log('Close button found:', closeBtn);
        
        closeBtn.onclick = () => {
            console.log('Close button clicked');
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            console.log('Modal clicked:', e.target === modal ? 'outside content' : 'inside content');
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };

        // Close modal when pressing Escape key
        const escapeHandler = function(e) {
            console.log('Key pressed:', e.key);
            if (e.key === 'Escape' && document.body.contains(modal)) {
                console.log('Escape pressed, removing modal');
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
        console.log('Modal setup complete');
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
        console.log('=== Displaying Restaurants ===');
        restaurantGrid.innerHTML = '';
        let visibleCount = 0;
        const maxVisible = currentCategory === 'all' ? Infinity : 5;

        const filteredRestaurants = restaurants.filter(restaurant => {
            const categoryMatch = currentCategory === 'all' || restaurant.category === currentCategory;
            const locationMatch = currentLocation === 'all' || 
                                restaurant.location.toLowerCase() === currentLocation.toLowerCase();
            return categoryMatch && locationMatch;
        });

        console.log('Filtered restaurants:', filteredRestaurants);

        if (filteredRestaurants.length === 0) {
            showNoResults();
            return;
        }

        filteredRestaurants.slice(0, maxVisible).forEach(restaurant => {
            console.log('Creating card for restaurant:', restaurant);
            const card = createRestaurantCard(restaurant);
            restaurantGrid.appendChild(card);
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
        console.log('Searching for:', searchTerm);
        
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
            console.log('Found restaurants:', filteredRestaurants);
            filteredRestaurants.forEach(restaurant => {
                const card = createRestaurantCard(restaurant);
                restaurantGrid.appendChild(card);
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