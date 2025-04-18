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

// Function to get price range text with dollar amounts
function getPriceRangeText(priceRange) {
    switch(priceRange) {
        case 1:
            return '$ (Below $15)';
        case 2:
            return '$$ ($15-$30)';
        case 3:
            return '$$$ ($31-$50)';
        case 4:
            return '$$$$ (Above $50)';
        default:
            return 'Price not available';
    }
}

// Function to display restaurant details
function displayRestaurantDetails(restaurant) {
    // Update banner image
    document.querySelector('.banner-section img').src = restaurant.bannerImage;
    
    // Update main info
    document.querySelector('.main-info h1').textContent = restaurant.name;
    document.querySelector('.chinese-name').textContent = restaurant.nameChinese || '';
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
        <div class="price-range">${getPriceRangeText(restaurant.priceRange)}</div>
    `;

    // Update action buttons
    if (restaurant.menuUrl) {
        const menuBtn = document.querySelector('.menu-btn');
        menuBtn.href = restaurant.menuUrl;
        menuBtn.style.display = 'flex';
    }
    if (restaurant.bookingUrl) {
        const bookingBtn = document.querySelector('.booking-btn');
        bookingBtn.href = restaurant.bookingUrl;
        bookingBtn.style.display = 'flex';
    }
    if (restaurant.googleReviewUrl) {
        const googleBtn = document.querySelector('.google-btn');
        googleBtn.href = restaurant.googleReviewUrl;
        googleBtn.style.display = 'flex';
    }

    // Update contact info
    const contactInfo = document.querySelector('.contact-info');
    contactInfo.innerHTML = ''; // Clear existing content

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

    // Add address
    if (restaurant.address) {
        contactInfo.innerHTML += `
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${restaurant.address}</span>
            </div>
        `;
    }

    // Add Facebook and XHS links
    const socialLinks = document.createElement('div');
    socialLinks.className = 'social-links';
    
    if (restaurant.facebookUrl) {
        socialLinks.innerHTML += `
            <a href="${restaurant.facebookUrl}" target="_blank" class="social-link">
                <img src="/images/facebook-icon.png" alt="Facebook" title="Visit our Facebook page">
            </a>
        `;
    }

    if (restaurant.xhsUrl) {
        socialLinks.innerHTML += `
            <a href="${restaurant.xhsUrl}" target="_blank" class="social-link">
                <img src="/images/xhs-icon.png" alt="XHS" title="Visit our Xiaohongshu page">
            </a>
        `;
    }

    if (socialLinks.innerHTML) {
        contactInfo.appendChild(socialLinks);
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
        document.querySelector('.photos-section').style.display = 'block';
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
        document.querySelector('.reviews-section').style.display = 'block';
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

// Star Rating Functionality
const starRating = document.querySelector('.star-rating');
const stars = starRating.querySelectorAll('i');
let selectedRating = 0;

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        selectedRating = index + 1;
        updateStars();
    });

    star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => {
            if (i <= index) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });

    star.addEventListener('mouseout', () => {
        updateStars();
    });
});

function updateStars() {
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Review Form Submission
const reviewForm = document.querySelector('.review-form');
const successMessage = document.querySelector('.review-success');

reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reviewerName = document.getElementById('reviewer-name').value;
    const reviewText = document.getElementById('review-text').value;

    if (!reviewerName || !reviewText || selectedRating === 0) {
        alert('Please fill in all fields and select a rating');
        return;
    }

    const reviewData = {
        restaurantId: restaurantId,
        reviewerName,
        rating: selectedRating,
        reviewText,
        status: 'pending' // For admin approval
    };

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            // Clear form
            reviewForm.reset();
            selectedRating = 0;
            updateStars();
            
            // Show success message
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        } else {
            throw new Error('Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again later.');
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!restaurantId) {
        displayError('No restaurant specified');
        return;
    }
    fetchRestaurantDetails();
}); 