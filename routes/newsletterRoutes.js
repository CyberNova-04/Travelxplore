const express = require('express');
const router = express.Router();
const db = require('../config/database');
const nodemailer = require('nodemailer');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Subscribe to newsletter (PUBLIC - no auth)
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    
    try {
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
            html: '<h1>Welcome to TravelXplore newsletter!</h1><p>Stay tuned for updates.</p>'
        });
        
        res.json({ success: true, message: 'Subscribed and email sent!' });
    } catch (err) {
        console.error('Newsletter subscription error:', err);
        res.status(500).json({ success: false, message: 'Subscription failed' });
    }
});

// Get all newsletter subscribers (ADMIN ONLY)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [subscribers] = await db.execute(
            'SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        );
        
        res.json({
            success: true,
            count: subscribers.length,
            subscribers: subscribers
        });
    } catch (err) {
        console.error('Get subscribers error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Delete subscriber (ADMIN ONLY)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Subscriber not found' });
        }
        
        res.json({ success: true, message: 'Subscriber deleted successfully' });
    } catch (err) {
        console.error('Delete subscriber error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
