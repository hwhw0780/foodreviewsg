const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sgbestfoodplatform@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App password from Gmail
    }
});

// Handle partner inquiry submissions
router.post('/partner-inquiry', async (req, res) => {
    console.log('Received partner inquiry:', req.body);
    
    try {
        const { restaurantName, email, phone, website } = req.body;

        // Validate required fields
        if (!restaurantName || !email || !phone) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'Restaurant name, email, and phone are required' });
        }

        // Email content
        const mailOptions = {
            from: 'sgbestfoodplatform@gmail.com',
            to: 'sgbestfoodplatform@gmail.com',
            subject: 'New Restaurant Partner Inquiry',
            html: `
                <h2>New Restaurant Partner Inquiry</h2>
                <p><strong>Restaurant Name:</strong> ${restaurantName}</p>
                <p><strong>Contact Email:</strong> ${email}</p>
                <p><strong>Contact Phone:</strong> ${phone}</p>
                <p><strong>Website:</strong> ${website || 'Not provided'}</p>
                <p>Please follow up with this inquiry as soon as possible.</p>
            `
        };

        console.log('Attempting to send email with options:', mailOptions);

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);

        res.status(200).json({ message: 'Inquiry submitted successfully' });
    } catch (error) {
        console.error('Error processing partner inquiry:', error);
        res.status(500).json({ error: 'Failed to process inquiry: ' + error.message });
    }
});

module.exports = router; 