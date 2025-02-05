// Get restaurant ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');

console.log('Restaurant ID from URL:', restaurantId);

// Function to fetch restaurant details
async function fetchRestaurantDetails() {
    try {
        console.log('Fetching details for restaurant ID:', restaurantId);
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Restaurant not found');
        }
        
        const restaurant = await response.json();
        console.log('Restaurant data received:', restaurant);
        displayRestaurantDetails(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        displayError('Restaurant not found or an error occurred.');
    }
}

// Function to display restaurant details
function displayRestaurantDetails(restaurant) {
    // Update banner image
    document.querySelector('.banner-section img').src = restaurant.bannerImage;
    
    // Update main info
    document.querySelector('.main-info h1').textContent = restaurant.name;
    document.querySelector('.chinese-name').textContent = restaurant.chineseName || '';
    document.querySelector('.category-location').innerHTML = `
        ${restaurant.category} <span class="separator">•</span> ${restaurant.location}
    `;

    // Update rating and price
    const stars = '★'.repeat(Math.floor(restaurant.rating)) + 
                 (restaurant.rating % 1 >= 0.5 ? '½' : '') +
                 '☆'.repeat(5 - Math.ceil(restaurant.rating));
    document.querySelector('.rating-section').innerHTML = `
        <div class="stars">${stars}</div>
        <div class="review-count">(${restaurant.reviewCount} reviews)</div>
        <span class="separator">•</span>
        <div class="price-range">${'$'.repeat(restaurant.priceRange)}</div>
    `;

    // Update action buttons
    if (restaurant.menuUrl) {
        document.querySelector('.menu-btn').href = restaurant.menuUrl;
    }
    if (restaurant.bookingUrl) {
        document.querySelector('.booking-btn').href = restaurant.bookingUrl;
    }
    if (restaurant.googleReviewUrl) {
        document.querySelector('.google-btn').href = restaurant.googleReviewUrl;
    }

    // Update contact info
    const contactInfo = document.querySelector('.contact-info');
    if (restaurant.phone) {
        contactInfo.innerHTML += `
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <a href="tel:${restaurant.phone}">${restaurant.phone}</a>
            </div>
        `;
    }
    if (restaurant.website) {
        contactInfo.innerHTML += `
            <div class="info-item">
                <i class="fas fa-globe"></i>
                <a href="${restaurant.website}" target="_blank">${restaurant.website}</a>
            </div>
        `;
    }

    // Update photos grid
    const photosGrid = document.querySelector('.photos-grid');
    if (restaurant.photos && restaurant.photos.length > 0) {
        photosGrid.innerHTML = restaurant.photos
            .map(photo => `
                <img src="${photo}" alt="${restaurant.name}" 
                     onclick="openPhotoModal('${photo}')"
                />
            `).join('');
    } else {
        document.querySelector('.photos-section').style.display = 'none';
    }

    // Update reviews
    const reviewsContainer = document.querySelector('.reviews-container');
    if (restaurant.customReviews && restaurant.customReviews.length > 0) {
        reviewsContainer.innerHTML = restaurant.customReviews
            .map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="reviewer-name">${review.author}</div>
                        <div class="review-rating">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                    </div>
                    <div class="review-comment">${review.comment}</div>
                </div>
            `).join('');
    } else {
        document.querySelector('.reviews-section').style.display = 'none';
    }
}

// Function to display error message
function displayError(message) {
    const container = document.querySelector('.restaurant-details');
    container.innerHTML = `
        <div class="error-message">
            <h2>${message}</h2>
            <a href="/" class="action-btn">Return to Home</a>
        </div>
    `;
}

// Photo modal functionality
function openPhotoModal(photoUrl) {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${photoUrl}" alt="Restaurant photo">
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .photo-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    .modal-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }
    .close-modal {
        position: absolute;
        top: -30px;
        right: 0;
        color: white;
        font-size: 28px;
        cursor: pointer;
    }
`;
document.head.appendChild(modalStyles);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!restaurantId) {
        displayError('No restaurant specified');
        return;
    }
    fetchRestaurantDetails();
}); 