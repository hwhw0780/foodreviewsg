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
                <td class="ad-status-cell">
                    <label class="ad-toggle">
                        <input type="checkbox" ${restaurant.adStatus !== 'none' ? 'checked' : ''}>
                        <span class="ad-toggle-slider"></span>
                    </label>
                    <span class="ad-badge ${restaurant.adStatus}">${restaurant.adStatus}</span>
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

            // Add event listener for ad toggle
            const toggle = tr.querySelector('.ad-toggle input');
            toggle.addEventListener('change', async (e) => {
                const newStatus = e.target.checked ? 'gold' : 'none';
                await updateAdStatus(restaurant.id, newStatus);
            });
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
            const customReviewsContainer = document.getElementById('custom-reviews-container');
            if (!customReviewsContainer) return;

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
            formData.append('rating', document.getElementById('restaurant-rating').value);
            formData.append('reviewCount', document.getElementById('restaurant-reviews').value);
            formData.append('googleReviewUrl', document.getElementById('google-review-url').value);
            formData.append('menuUrl', document.getElementById('menu-url').value);
            formData.append('bookingUrl', document.getElementById('booking-url').value);
            formData.append('facebookUrl', document.getElementById('facebook-url').value);
            formData.append('xhsUrl', document.getElementById('xhs-url').value);
            formData.append('customReviews', JSON.stringify(customReviews));
            
            // Check if we're editing or creating
            const restaurantId = this.dataset.restaurantId;
            const isEditing = !!restaurantId;

            // If editing, get the existing restaurant data
            let existingRestaurant;
            if (isEditing) {
                existingRestaurant = restaurants.find(r => r.id === parseInt(restaurantId));
            }
            
            // Only append files if they are selected
            if (bannerInput.files[0]) {
                formData.append('bannerImage', bannerInput.files[0]);
            } else if (isEditing && existingRestaurant?.bannerImage) {
                // Keep existing banner image
                formData.append('keepExistingBanner', 'true');
            }

            if (photosInput.files.length > 0) {
                Array.from(photosInput.files).forEach(file => {
                    formData.append('photos', file);
                });
            } else if (isEditing && existingRestaurant?.photos) {
                // Keep existing photos
                formData.append('keepExistingPhotos', 'true');
            }

            try {
                const url = isEditing ? `/api/restaurants/${restaurantId}` : '/api/restaurants';
                const method = isEditing ? 'PUT' : 'POST';
                
                console.log(`${isEditing ? 'Updating' : 'Creating'} restaurant with data:`, Object.fromEntries(formData));
                
                const response = await fetch(url, {
                    method: method,
                    body: formData
                });

                if (response.ok) {
                    showMessage(`Restaurant ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
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
                    // Clear the restaurant ID if we were editing
                    delete addRestaurantForm.dataset.restaurantId;
                    // Refresh restaurant list
                    fetchRestaurants();
                } else {
                    throw new Error('Failed to save restaurant');
                }
            } catch (error) {
                showMessage(`Failed to ${this.dataset.restaurantId ? 'update' : 'add'} restaurant: ` + error.message, 'error');
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

            // Show form
            const restaurantFormSection = document.getElementById('restaurant-form-section');
            const previewSection = document.getElementById('preview-section');
            const addRestaurantBtn = document.getElementById('add-restaurant-btn');
            
            if (restaurantFormSection && previewSection && addRestaurantBtn) {
                restaurantFormSection.style.display = 'block';
                previewSection.style.display = 'block';
                addRestaurantBtn.style.display = 'none';
            }

            // Populate form fields
            document.getElementById('restaurant-name').value = restaurant.name || '';
            document.getElementById('restaurant-name-chinese').value = restaurant.nameChinese || '';
            document.getElementById('restaurant-category').value = restaurant.category || '';
            document.getElementById('restaurant-website').value = restaurant.website || '';
            document.getElementById('restaurant-phone').value = restaurant.phone || '';
            document.getElementById('restaurant-location').value = restaurant.location || '';
            document.getElementById('restaurant-address').value = restaurant.address || '';
            document.getElementById('price-range').value = restaurant.priceRange || 1;
            document.getElementById('restaurant-rating').value = restaurant.rating || 0;
            document.getElementById('restaurant-reviews').value = restaurant.reviewCount || 0;
            document.getElementById('menu-url').value = restaurant.menuUrl || '';
            document.getElementById('booking-url').value = restaurant.bookingUrl || '';
            document.getElementById('google-review-url').value = restaurant.googleReviewUrl || '';
            document.getElementById('facebook-url').value = restaurant.facebookUrl || '';
            document.getElementById('xhs-url').value = restaurant.xhsUrl || '';

            // Show existing banner image
            const bannerPreview = document.getElementById('banner-preview');
            const previewBannerImage = document.getElementById('preview-banner-image');
            if (bannerPreview && restaurant.bannerImage) {
                bannerPreview.innerHTML = `<img src="${restaurant.bannerImage}" alt="Banner Preview">`;
            }
            if (previewBannerImage) {
                previewBannerImage.src = restaurant.bannerImage || '#';
            }

            // Show existing photos
            const photosPreview = document.getElementById('photos-preview');
            const previewPhotosGrid = document.getElementById('preview-photos');
            if (photosPreview && restaurant.photos && Array.isArray(restaurant.photos)) {
                photosPreview.innerHTML = restaurant.photos
                    .map(photo => `<img src="${photo}" alt="Restaurant Photo">`)
                    .join('');
            }
            if (previewPhotosGrid && restaurant.photos && Array.isArray(restaurant.photos)) {
                previewPhotosGrid.innerHTML = restaurant.photos
                    .map(photo => `<img src="${photo}" alt="Restaurant Photo">`)
                    .join('');
            }

            // Clear and populate custom reviews
            const customReviewsContainer = document.getElementById('custom-reviews-container');
            if (customReviewsContainer) {
                customReviewsContainer.innerHTML = '';
                if (restaurant.customReviews && Array.isArray(restaurant.customReviews)) {
                    restaurant.customReviews.forEach(review => {
                        customReviewsContainer.appendChild(createReviewElement(review));
                    });
                }
                updateCustomReviews();
            }

            // Update form title and submit button
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.querySelector('#add-restaurant-form button[type="submit"]');
            
            if (formTitle) formTitle.textContent = 'Edit Restaurant';
            if (submitBtn) submitBtn.textContent = 'Update Restaurant';

            // Store the restaurant ID for the update operation
            document.getElementById('add-restaurant-form').dataset.restaurantId = id;

            // Scroll to form
            restaurantFormSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Edit restaurant error:', error);
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

    // Ad Status Modal Functions
    const adStatusModal = document.getElementById('ad-status-modal');
    const closeModalBtn = adStatusModal.querySelector('.close');
    const adStatusForm = document.getElementById('ad-status-form');
    let currentRestaurantId = null;

    function showAdStatusModal(restaurantId) {
        currentRestaurantId = restaurantId;
        const restaurant = restaurants.find(r => r.id === parseInt(restaurantId));
        
        if (!restaurant) {
            console.error('Restaurant not found:', restaurantId);
            return;
        }
        
        // Set current values
        const adStatusSelect = document.getElementById('ad-status');
        const adExpiryInput = document.getElementById('ad-expiry');
        
        adStatusSelect.value = restaurant.adStatus || 'none';
        
        if (restaurant.adExpiryDate) {
            const date = new Date(restaurant.adExpiryDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            adExpiryInput.value = `${year}-${month}-${day}`;
        } else {
            // Set default expiry date to 30 days from now
            const date = new Date();
            date.setDate(date.getDate() + 30);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            adExpiryInput.value = `${year}-${month}-${day}`;
        }
        
        adStatusModal.style.display = 'block';
    }

    closeModalBtn.onclick = function() {
        adStatusModal.style.display = 'none';
        // Reset toggle if user closes without saving
        if (currentRestaurantId) {
            const toggle = document.querySelector(`.ad-toggle input[data-restaurant-id="${currentRestaurantId}"]`);
            const restaurant = restaurants.find(r => r.id === parseInt(currentRestaurantId));
            if (toggle && restaurant) {
                toggle.checked = restaurant.adStatus !== 'none';
            }
        }
    }

    window.onclick = function(event) {
        if (event.target === adStatusModal) {
            closeModalBtn.onclick();
        }
    }

    adStatusForm.onsubmit = async function(e) {
        e.preventDefault();
        const status = document.getElementById('ad-status').value;
        const expiryDate = document.getElementById('ad-expiry').value;
        
        if (!currentRestaurantId) {
            showMessage('Error: No restaurant selected', 'error');
            return;
        }
        
        await updateAdStatus(currentRestaurantId, status);
        adStatusModal.style.display = 'none';
    }

    async function updateAdStatus(restaurantId, status) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/ad-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update ad status');
            }

            // Refresh the restaurant list to show updated status
            await fetchRestaurants();
            showMessage('Ad status updated successfully', 'success');
        } catch (error) {
            console.error('Error updating ad status:', error);
            showMessage('Failed to update ad status', 'error');
        }
    }

    // Initial fetch of restaurants if on dashboard
    if (window.location.href.includes('dashboard.html')) {
        fetchRestaurants();
    }
}); 