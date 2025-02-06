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
    try {
        const { restaurantName, email, phone, website } = req.body;

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

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Inquiry submitted successfully' });
    } catch (error) {
        console.error('Error processing partner inquiry:', error);
        res.status(500).json({ error: 'Failed to process inquiry' });
    }
});

module.exports = router; 