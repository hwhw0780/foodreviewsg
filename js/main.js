document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for advertise button
    const advertiseBtn = document.querySelector('.advertise-btn');
    if (advertiseBtn) {
        advertiseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const partnerSection = document.querySelector('#contact');
            if (partnerSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = partnerSection.offsetTop - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Get DOM elements
    const categoryButtons = document.querySelectorAll('.category-btn');
    const locationSelect = document.getElementById('location-select');
    const restaurantGrid = document.querySelector('.restaurant-grid');
    const featuredTitle = document.getElementById('featured-title');

    // Current filter state
    let currentCategory = 'all';
    let currentLocation = 'all';
    let restaurants = [];
    let restaurantCache = new Map();
    let lastCacheUpdate = null;
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

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

    // Function to get category display text
    function getCategoryText(category) {
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    }

    // Sample restaurant data
    const sampleRestaurants = [];

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

    // Function to get price range text based on value
    function getPriceRangeText(priceRange) {
        switch (parseInt(priceRange)) {
            case 1: return '$ (Below $15)';
            case 2: return '$$ ($15-$30)';
            case 3: return '$$$ ($31-$50)';
            case 4: return '$$$$ (Above $50)';
            default: return '$ (Below $15)';
        }
    }

    // Create restaurant card HTML
    function createRestaurantCard(restaurant) {
        const card = document.createElement('div');
        card.className = `restaurant-card ${restaurant.adStatus !== 'none' ? 'ad' : ''}`;
        card.dataset.category = restaurant.category;
        card.dataset.location = restaurant.location.toLowerCase().replace(/\s+/g, '-');

        // Add click event listener to show modal
        card.addEventListener('click', () => {
            window.location.href = `restaurant-details.html?id=${restaurant.id}`;
        });

        // Add ad indicator if restaurant has active ad status
        const adIndicator = restaurant.adStatus !== 'none' ? `
            <div class="ad-indicator">
                Ads
            </div>
        ` : '';

        card.innerHTML = `
            ${adIndicator}
            <div class="restaurant-image">
                <img src="${restaurant.bannerImage || '/images/default-restaurant.jpg'}" alt="${restaurant.name}">
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                ${restaurant.nameChinese ? `<p class="chinese-name">${restaurant.nameChinese}</p>` : ''}
                <p class="cuisine">${getCategoryText(restaurant.category)}</p>
                <div class="rating">
                    ${getRatingStars(restaurant.rating)}
                    <span>(${restaurant.reviewCount} reviews)</span>
                </div>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${restaurant.location}</p>
                <p class="price-range">${'$'.repeat(restaurant.priceRange)}</p>
            </div>
        `;

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
        
        // Get price range text
        const priceRangeText = getPriceRangeText(restaurant.priceRange);
        
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
                            <span class="price-range">${priceRangeText}</span>
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

    // Function to get random items from array
    function getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Function to get cached restaurants or generate new selection
    function getCachedOrRandomRestaurants(restaurants, cacheKey) {
        const now = Date.now();
        if (!lastCacheUpdate || (now - lastCacheUpdate) > CACHE_DURATION) {
            // Clear entire cache if it's time to update
            restaurantCache.clear();
            lastCacheUpdate = now;
        }

        if (!restaurantCache.has(cacheKey)) {
            // Generate new random selection if more than 5 restaurants
            if (restaurants.length > 5) {
                restaurantCache.set(cacheKey, getRandomItems(restaurants, 5));
            } else {
                restaurantCache.set(cacheKey, restaurants);
            }
        }

        return restaurantCache.get(cacheKey);
    }

    // Display filtered restaurants
    function displayRestaurants() {
        console.log('=== Displaying Restaurants ===');
        restaurantGrid.innerHTML = '';
        
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

        // Separate ads and regular restaurants
        const adRestaurants = filteredRestaurants.filter(r => r.adStatus !== 'none');
        const regularRestaurants = filteredRestaurants.filter(r => r.adStatus === 'none')
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5); // Get top 5 regular restaurants by rating

        // Randomly select ads for display
        let selectedAds = [];
        if (adRestaurants.length > 0) {
            // Shuffle ads
            const shuffledAds = [...adRestaurants].sort(() => Math.random() - 0.5);
            // Select up to 2 ads for before/after positions
            selectedAds = shuffledAds.slice(0, Math.min(2, shuffledAds.length));
            // If there are more ads, randomly add them to the regular list
            if (shuffledAds.length > 2) {
                const remainingAds = shuffledAds.slice(2);
                regularRestaurants.splice(Math.floor(Math.random() * regularRestaurants.length), 0, ...remainingAds);
            }
        }

        // Display restaurants in order: 1 ad (if available) + regular restaurants + 1 ad (if available)
        if (selectedAds.length > 0) {
            restaurantGrid.appendChild(createRestaurantCard(selectedAds[0]));
        }

        regularRestaurants.forEach(restaurant => {
            restaurantGrid.appendChild(createRestaurantCard(restaurant));
        });

        if (selectedAds.length > 1) {
            restaurantGrid.appendChild(createRestaurantCard(selectedAds[1]));
        }

        updateTitle(currentCategory, regularRestaurants.length);
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
            featuredTitle.textContent = `${categoryName} Restaurants`;
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
            // For search results, show all matches without random selection
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

    // Function to fetch statistics from the server
    async function fetchStatistics() {
        try {
            const response = await fetch('/api/statistics');
            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }
            const stats = await response.json();
            
            // Update the statistics using the existing updateStatistics function
            window.updateStatistics({
                'daily-users': stats.dailyUsers,
                'daily-bookings': stats.dailyBookings,
                'total-restaurants': stats.totalRestaurants,
                'total-reviews': stats.totalReviews
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }

    // Function to update statistics
    window.updateStatistics = function(stats) {
        const elements = {
            'daily-users': document.getElementById('daily-users'),
            'daily-bookings': document.getElementById('daily-bookings'),
            'total-restaurants': document.getElementById('total-restaurants'),
            'total-reviews': document.getElementById('total-reviews')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (element && typeof stats[key] !== 'undefined') {
                const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
                const newValue = parseInt(stats[key]) || 0;
                if (currentValue !== newValue) {
                    animateValue(element, currentValue, newValue, 1000);
                }
            }
        }
    };

    // Initial fetch of restaurants and statistics
    fetchRestaurants();
    fetchStatistics();

    // Set up periodic refresh of statistics
    setInterval(fetchStatistics, 30000); // Refresh every 30 seconds

    // Partner form submission handler
    const partnerForm = document.getElementById('partner-contact-form');
    if (partnerForm) {
        partnerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const restaurantName = document.getElementById('restaurant-name-input').value;
            const email = document.getElementById('contact-email').value;
            const phone = document.getElementById('contact-phone').value;
            const website = document.getElementById('restaurant-website').value;

            try {
                const response = await fetch('/api/partner-inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        restaurantName,
                        email,
                        phone,
                        website
                    })
                });

                if (response.ok) {
                    alert('Thank you for your interest! We will contact you soon.');
                    partnerForm.reset();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to submit form');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Sorry, there was an error submitting the form. Please try again later.');
            }
        });
    }

    // Navigation functionality
    const homeLink = document.querySelector('nav a[href="#"]');
    const restaurantLink = document.querySelector('nav a[href="#restaurants"]');
    const aboutLink = document.querySelector('nav a[href="#about"]');
    const contactLink = document.querySelector('nav a[href="#contact"]');

    // Home link - reload page
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
    }

    // Restaurant link - show all restaurants
    if (restaurantLink) {
        restaurantLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset filters to show all restaurants
            document.getElementById('categoryFilter').value = 'all';
            document.getElementById('locationFilter').value = 'all';
            // Trigger filter change to update display
            filterRestaurants();
            // Smooth scroll to restaurants section
            document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // About link - smooth scroll
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Contact link - smooth scroll
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Mobile Menu Functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    document.body.appendChild(mobileMenuOverlay);

    function toggleMobileMenu() {
        navLinks.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuOverlay.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}); 