// Join Page Event Tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track page view with additional details
    gtag('event', 'page_view', {
        'page_title': 'Join SG Best Food',
        'page_location': window.location.href,
        'page_path': '/join.html'
    });

    // Track pricing package views
    const pricingBoxes = document.querySelectorAll('.pricing-box');
    pricingBoxes.forEach(box => {
        const packageLabel = box.querySelector('.package-label').textContent;
        
        // Track when user hovers over pricing boxes
        box.addEventListener('mouseenter', () => {
            window.trackEvent('Pricing', 'hover', packageLabel);
        });

        // Track when user clicks on pricing boxes
        box.addEventListener('click', () => {
            window.trackEvent('Pricing', 'select', packageLabel);
        });
    });

    // Track partner form interactions
    const partnerForm = document.querySelector('.partner-form');
    if (partnerForm) {
        // Track form field interactions
        const formFields = partnerForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                window.trackEvent('Form', 'field_focus', field.name || field.id);
            });
        });

        // Track form submissions
        partnerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(partnerForm);
            const restaurantName = formData.get('restaurantName');
            const packageType = formData.get('packageType');

            // Track form submission attempt
            window.trackEvent('Form', 'submit_attempt', 'Partner Registration');

            try {
                const response = await fetch('/api/partner/partner-signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                if (response.ok) {
                    // Track successful submission
                    window.trackEvent('Form', 'submit_success', 'Partner Registration', {
                        'package_type': packageType
                    });
                    
                    alert('Thank you for joining! We will contact you shortly.');
                    partnerForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                // Track submission failure
                window.trackEvent('Form', 'submit_error', 'Partner Registration');
                console.error('Error:', error);
                alert('Sorry, there was an error submitting your form. Please try again.');
            }
        });
    }

    // Track payment option selections
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const paymentMethod = option.getAttribute('data-payment');
            window.trackEvent('Payment', 'select_method', paymentMethod);
        });
    });

    // Track benefit item interactions
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach(item => {
        const benefitTitle = item.querySelector('h4').textContent;
        item.addEventListener('mouseenter', () => {
            window.trackEvent('Benefits', 'hover', benefitTitle);
        });
    });

    // Track join button clicks
    const joinButtons = document.querySelectorAll('.join-btn');
    joinButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonContext = button.closest('.pricing-box') 
                ? button.closest('.pricing-box').querySelector('.package-label').textContent 
                : 'Generic';
            window.trackEvent('CTA', 'click', `Join Button - ${buttonContext}`);
        });
    });
}); 