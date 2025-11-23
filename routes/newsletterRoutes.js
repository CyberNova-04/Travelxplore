const express = require('express');
const router = express.Router();
const db = require('../config/database');
const nodemailer = require('nodemailer');

router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        // Use promise-based execute() instead of callback query()
        await db.execute('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)', [email]);

        // Send welcome email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'killsdead04@gmail.com',
                pass: 'sckmeybsrvykuirx'
            }
        });

        await transporter.sendMail({
            from: '"TravelXplore" <killsdead04@gmail.com>',
            to: email,
            subject: 'Thanks for subscribing!',
            text: 'Welcome to TravelXplore newsletter!',
            html: '<b>Welcome to TravelXplore newsletter! Stay tuned for updates.</b>'
        });

        res.json({ success: true, message: 'Subscribed and email sent!' });
    } catch (err) {
        console.error('Newsletter subscription error:', err);
        res.status(500).json({ success: false, message: 'Subscription failed' });
    }
});

module.exports = router;
