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
        const locationInput = document.getElementById('restaurant-location');
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
        locationInput.addEventListener('input', e => previewLocation.textContent = e.target.value);
        priceSelect.addEventListener('change', e => {
            const prices = ['$', '$$', '$$$', '$$$$'];
            previewPrice.textContent = prices[e.target.value - 1];
        });

        // Form submission
        addRestaurantForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Create FormData object to handle file uploads
            const formData = new FormData();
            formData.append('name', nameInput.value);
            formData.append('nameChinese', chineseNameInput.value);
            formData.append('category', categorySelect.value);
            formData.append('website', document.getElementById('restaurant-website').value);
            formData.append('phone', document.getElementById('restaurant-phone').value);
            formData.append('location', locationInput.value);
            formData.append('address', document.getElementById('restaurant-address').value);
            formData.append('priceRange', priceSelect.value);
            formData.append('bannerImage', bannerInput.files[0]);
            
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
                    // Clear previews
                    bannerPreview.innerHTML = '';
                    photosPreview.innerHTML = '';
                    previewBannerImage.src = '#';
                    previewPhotosGrid.innerHTML = '';
                } else {
                    throw new Error('Failed to add restaurant');
                }
            } catch (error) {
                showMessage('Failed to add restaurant: ' + error.message, 'error');
            }
        });
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
}); 