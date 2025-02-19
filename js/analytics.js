// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-S5DZFBK6Q9';

// Initialize Google Analytics
function initializeGA() {
    // Initialize the dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    window.gtag = gtag; // Make gtag globally available
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    // Custom event tracking
    window.trackEvent = function(category, action, label = null, value = null) {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    };
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', initializeGA);

// Export for use in other files
window.initializeGA = initializeGA;
window.GA_MEASUREMENT_ID = GA_MEASUREMENT_ID; 