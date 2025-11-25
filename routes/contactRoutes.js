const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Submit contact form (PUBLIC - no auth)
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, email, subject, message } = req.body;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, subject, message, 'new']
        );
        
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!',
            messageId: result.insertId
        });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all contact messages (ADMIN ONLY)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [messages] = await db.execute(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        
        res.json({ 
            success: true, 
            count: messages.length, 
            contacts: messages,
            messages: messages
        });
    } catch (err) {
        console.error('Get contacts error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Delete message (ADMIN ONLY)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Mark message as read/unread (ADMIN ONLY)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
    const { status } = req.body; // status should be 'new' or 'read'
    if (!['new','read'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Bad status' });
    }
    const [result] = await db.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Status updated' });
});


module.exports = router;
