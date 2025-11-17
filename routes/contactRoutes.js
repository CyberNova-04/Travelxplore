const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Submit contact form
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message too short')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, subject, message } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO contact_messages (name,email,subject,message,status) VALUES (?,?,?,?,?)',
            [name,email,subject,message,'new']
        );
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            messageId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all contact messages (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    const { status, limit = 100 } = req.query;
    let sql = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status=?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    try {
        const [messages] = await db.query(sql, params);
        res.json({ success: true, count: messages.length, messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single message (admin)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [msgs] = await db.query('SELECT * FROM contact_messages WHERE id=?', [req.params.id]);
        if (!msgs.length) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        await db.query('UPDATE contact_messages SET status=? WHERE id=?', ['read', req.params.id]);
        res.json({ success: true, message: msgs[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update message status (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    if (!['new','read','replied'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    try {
        const [result] = await db.query('UPDATE contact_messages SET status=? WHERE id=?', [status, req.params.id]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete message (admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM contact_messages WHERE id=?', [req.params.id]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Stats summary (admin)
router.get('/stats/summary', verifyToken, isAdmin, async (req, res) => {
    try {
        const [[{ count: newCount }]] = await db.query(
            'SELECT COUNT(*) AS count FROM contact_messages WHERE status=?', ['new']
        );
        const [[{ count: totalCount }]] = await db.query(
            'SELECT COUNT(*) AS count FROM contact_messages'
        );
        const [[{ count: repliedCount }]] = await db.query(
            'SELECT COUNT(*) AS count FROM contact_messages WHERE status=?', ['replied']
        );
        res.json({
            success: true,
            stats: { total: totalCount, new: newCount, replied: repliedCount }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
