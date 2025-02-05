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

    // Restaurant list functionality
    let restaurants = [];
    const restaurantTable = document.getElementById('restaurants-table');
    const filterCategory = document.getElementById('filter-category');
    const filterLocation = document.getElementById('filter-location');
    const restaurantSearch = document.getElementById('restaurant-search');
    const addRestaurantBtn = document.getElementById('add-restaurant-btn');
    const restaurantFormSection = document.getElementById('restaurant-form-section');
    const previewSection = document.getElementById('preview-section');
    const cancelFormBtn = document.getElementById('cancel-form');

    // Fetch and display restaurants
    async function fetchRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            if (!response.ok) {
                throw new Error('Failed to fetch restaurants');
            }
            restaurants = await response.json();
            displayRestaurants();
        } catch (error) {
            showMessage('Failed to fetch restaurants: ' + error.message, 'error');
        }
    }

    // Display restaurants in table
    function displayRestaurants(filtered = restaurants) {
        const tbody = restaurantTable.querySelector('tbody');
        tbody.innerHTML = '';

        filtered.forEach(restaurant => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${restaurant.name}</td>
                <td>${restaurant.nameChinese || '-'}</td>
                <td>${restaurant.category}</td>
                <td>${restaurant.location}</td>
                <td>${restaurant.rating.toFixed(1)}</td>
                <td>
                    ${restaurant.reviewCount}
                    ${restaurant.googleReviewUrl ? 
                        `<a href="${restaurant.googleReviewUrl}" target="_blank" class="google-review-link">
                            <i class="fab fa-google"></i>
                        </a>` : ''}
                </td>
                <td class="table-actions">
                    <button class="edit-btn" data-id="${restaurant.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${restaurant.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to action buttons
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editRestaurant(btn.dataset.id));
        });

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteRestaurant(btn.dataset.id));
        });
    }

    // Filter restaurants
    function filterRestaurants() {
        const category = filterCategory.value;
        const location = filterLocation.value;
        const searchTerm = restaurantSearch.value.toLowerCase();

        const filtered = restaurants.filter(restaurant => {
            const categoryMatch = category === 'all' || restaurant.category === category;
            const locationMatch = location === 'all' || 
                                restaurant.location.toLowerCase() === location.toLowerCase();
            const searchMatch = restaurant.name.toLowerCase().includes(searchTerm) ||
                              (restaurant.nameChinese && restaurant.nameChinese.toLowerCase().includes(searchTerm));

            return categoryMatch && locationMatch && searchMatch;
        });

        displayRestaurants(filtered);
    }

    // Add event listeners for filters
    if (filterCategory) {
        filterCategory.addEventListener('change', filterRestaurants);
        filterLocation.addEventListener('change', filterRestaurants);
        restaurantSearch.addEventListener('input', filterRestaurants);
    }

    // Toggle form visibility
    if (addRestaurantBtn) {
        addRestaurantBtn.addEventListener('click', () => {
            restaurantFormSection.style.display = 'block';
            previewSection.style.display = 'block';
            addRestaurantBtn.style.display = 'none';
        });
    }

    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            restaurantFormSection.style.display = 'none';
            previewSection.style.display = 'none';
            addRestaurantBtn.style.display = 'block';
            document.getElementById('add-restaurant-form').reset();
        });
    }

    // Restaurant form handling
    const addRestaurantForm = document.getElementById('add-restaurant-form');
    if (addRestaurantForm) {
        // Image preview handling
        const bannerInput = document.getElementById('banner-image');
        const bannerPreview = document.getElementById('banner-preview');
        const photosInput = document.getElementById('other-photos');
        const photosPreview = document.getElementById('photos-preview');
        const previewBannerImage = document.getElementById('preview-banner-image');
        const previewPhotosGrid = document.getElementById('preview-photos');

        // Handle banner image preview
        bannerInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    bannerPreview.innerHTML = '';
                    bannerPreview.appendChild(img);
                    previewBannerImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle multiple photos preview
        photosInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            photosPreview.innerHTML = '';
            previewPhotosGrid.innerHTML = '';
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Add to form preview
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    photosPreview.appendChild(img);
                    
                    // Add to restaurant preview
                    const previewImg = document.createElement('img');
                    previewImg.src = e.target.result;
                    previewPhotosGrid.appendChild(previewImg);
                };
                reader.readAsDataURL(file);
            });
        });

        // Live preview updates
        const nameInput = document.getElementById('restaurant-name');
        const chineseNameInput = document.getElementById('restaurant-name-chinese');
        const categorySelect = document.getElementById('restaurant-category');
        const locationSelect = document.getElementById('restaurant-location');
        const priceSelect = document.getElementById('price-range');

        const previewName = document.getElementById('preview-name');
        const previewChineseName = document.getElementById('preview-chinese-name');
        const previewCategory = document.getElementById('preview-category');
        const previewLocation = document.getElementById('preview-location');
        const previewPrice = document.getElementById('preview-price');

        // Update preview on input changes
        nameInput.addEventListener('input', e => previewName.textContent = e.target.value);
        chineseNameInput.addEventListener('input', e => previewChineseName.textContent = e.target.value);
        categorySelect.addEventListener('change', e => {
            const option = e.target.options[e.target.selectedIndex];
            previewCategory.textContent = option.text;
        });
        locationSelect.addEventListener('change', e => {
            const option = e.target.options[e.target.selectedIndex];
            previewLocation.textContent = option.text;
        });
        priceSelect.addEventListener('change', e => {
            const prices = ['$', '$$', '$$$', '$$$$'];
            previewPrice.textContent = prices[e.target.value - 1];
        });

        // Add review button handling
        const addReviewBtn = document.getElementById('add-review-btn');
        const customReviewsContainer = document.getElementById('custom-reviews-container');
        let customReviews = [];

        function createReviewElement(review = null) {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review-item';
            reviewDiv.innerHTML = `
                <div class="review-header">
                    <input type="text" class="review-author" placeholder="Author Name" value="${review?.author || ''}" required>
                    <select class="review-rating" required>
                        ${[1, 2, 3, 4, 5].map(num => 
                            `<option value="${num}" ${review?.rating === num ? 'selected' : ''}>${num} Star${num > 1 ? 's' : ''}</option>`
                        ).join('')}
                    </select>
                    <button type="button" class="remove-review-btn"><i class="fas fa-trash"></i></button>
                </div>
                <textarea class="review-comment" placeholder="Write your review here..." required>${review?.comment || ''}</textarea>
            `;

            const removeBtn = reviewDiv.querySelector('.remove-review-btn');
            removeBtn.addEventListener('click', () => {
                reviewDiv.remove();
                updateCustomReviews();
            });

            reviewDiv.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('change', updateCustomReviews);
            });

            return reviewDiv;
        }

        function updateCustomReviews() {
            customReviews = Array.from(customReviewsContainer.querySelectorAll('.review-item')).map(item => ({
                author: item.querySelector('.review-author').value,
                rating: parseInt(item.querySelector('.review-rating').value),
                comment: item.querySelector('.review-comment').value
            }));
        }

        addReviewBtn.addEventListener('click', () => {
            customReviewsContainer.appendChild(createReviewElement());
        });

        // Add two default reviews when form is shown
        addRestaurantBtn.addEventListener('click', () => {
            // ... existing show form code ...
            
            // Add default good review
            customReviewsContainer.appendChild(createReviewElement({
                author: "John Doe",
                rating: 5,
                comment: "Amazing food and great service! Highly recommended!"
            }));

            // Add default bad review
            customReviewsContainer.appendChild(createReviewElement({
                author: "Jane Smith",
                rating: 2,
                comment: "Food was mediocre and service was slow. Needs improvement."
            }));

            updateCustomReviews();
        });

        // Update form submission
        addRestaurantForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('name', nameInput.value);
            formData.append('nameChinese', chineseNameInput.value);
            formData.append('category', categorySelect.value);
            formData.append('website', document.getElementById('restaurant-website').value);
            formData.append('phone', document.getElementById('restaurant-phone').value);
            formData.append('location', locationSelect.value);
            formData.append('address', document.getElementById('restaurant-address').value);
            formData.append('priceRange', priceSelect.value);
            formData.append('bannerImage', bannerInput.files[0]);
            formData.append('rating', document.getElementById('restaurant-rating').value);
            formData.append('reviewCount', document.getElementById('restaurant-reviews').value);
            formData.append('googleReviewUrl', document.getElementById('google-review-url').value);
            formData.append('menuUrl', document.getElementById('menu-url').value);
            formData.append('bookingUrl', document.getElementById('booking-url').value);
            formData.append('facebookUrl', document.getElementById('facebook-url').value);
            formData.append('xhsUrl', document.getElementById('xhs-url').value);
            formData.append('customReviews', JSON.stringify(customReviews));
            
            Array.from(photosInput.files).forEach(file => {
                formData.append('photos', file);
            });

            try {
                const response = await fetch('/api/restaurants', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    showMessage('Restaurant added successfully!', 'success');
                    addRestaurantForm.reset();
                    customReviewsContainer.innerHTML = '';
                    customReviews = [];
                    // Clear previews
                    bannerPreview.innerHTML = '';
                    photosPreview.innerHTML = '';
                    previewBannerImage.src = '#';
                    previewPhotosGrid.innerHTML = '';
                    // Hide form and show list
                    restaurantFormSection.style.display = 'none';
                    previewSection.style.display = 'none';
                    addRestaurantBtn.style.display = 'block';
                    // Refresh restaurant list
                    fetchRestaurants();
                } else {
                    throw new Error('Failed to add restaurant');
                }
            } catch (error) {
                showMessage('Failed to add restaurant: ' + error.message, 'error');
            }
        });
    }

    // Edit restaurant
    async function editRestaurant(id) {
        try {
            const restaurant = restaurants.find(r => r.id === parseInt(id));
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            // Populate form
            document.getElementById('restaurant-name').value = restaurant.name;
            document.getElementById('restaurant-name-chinese').value = restaurant.nameChinese || '';
            document.getElementById('restaurant-category').value = restaurant.category;
            document.getElementById('restaurant-website').value = restaurant.website || '';
            document.getElementById('restaurant-phone').value = restaurant.phone || '';
            document.getElementById('restaurant-location').value = restaurant.location;
            document.getElementById('restaurant-address').value = restaurant.address;
            document.getElementById('price-range').value = restaurant.priceRange;
            document.getElementById('menu-url').value = restaurant.menuUrl || '';
            document.getElementById('booking-url').value = restaurant.bookingUrl || '';
            document.getElementById('google-review-url').value = restaurant.googleReviewUrl || '';
            document.getElementById('facebook-url').value = restaurant.facebookUrl || '';
            document.getElementById('xhs-url').value = restaurant.xhsUrl || '';
            
            // Clear and populate custom reviews
            customReviewsContainer.innerHTML = '';
            if (restaurant.customReviews) {
                restaurant.customReviews.forEach(review => {
                    customReviewsContainer.appendChild(createReviewElement(review));
                });
            }
            updateCustomReviews();

            // Show form
            restaurantFormSection.style.display = 'block';
            previewSection.style.display = 'block';
            addRestaurantBtn.style.display = 'none';

            // Update form title and submit button
            document.getElementById('form-title').textContent = 'Edit Restaurant';
            const submitBtn = addRestaurantForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Restaurant';

            // Scroll to form
            restaurantFormSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showMessage('Failed to edit restaurant: ' + error.message, 'error');
        }
    }

    // Delete restaurant
    async function deleteRestaurant(id) {
        if (confirm('Are you sure you want to delete this restaurant?')) {
            try {
                const response = await fetch(`/api/restaurants/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showMessage('Restaurant deleted successfully!', 'success');
                    fetchRestaurants();
                } else {
                    throw new Error('Failed to delete restaurant');
                }
            } catch (error) {
                showMessage('Failed to delete restaurant: ' + error.message, 'error');
            }
        }
    }

    // Statistics update handling
    const updateStatsBtn = document.getElementById('update-stats-btn');
    if (updateStatsBtn) {
        updateStatsBtn.addEventListener('click', async function() {
            const stats = {
                'daily-users': parseInt(document.getElementById('daily-users-input').value),
                'daily-bookings': parseInt(document.getElementById('daily-bookings-input').value),
                'total-restaurants': parseInt(document.getElementById('total-restaurants-input').value),
                'total-reviews': parseInt(document.getElementById('total-reviews-input').value)
            };

            try {
                // Update statistics in the database
                const response = await fetch('/api/statistics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stats)
                });

                if (response.ok) {
                    // Update statistics on the main page if it's open
                    if (window.opener && !window.opener.closed) {
                        window.opener.updateStatistics(stats);
                    }
                    showMessage('Statistics updated successfully!', 'success');
                } else {
                    throw new Error('Failed to update statistics');
                }
            } catch (error) {
                showMessage('Failed to update statistics: ' + error.message, 'error');
            }
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

    // Initial fetch of restaurants if on dashboard
    if (window.location.href.includes('dashboard.html')) {
        fetchRestaurants();
    }
}); 