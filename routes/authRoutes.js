const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Register User
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { username, email, password, full_name } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length) {
            return res.status(400).json({ success: false, message: 'Email or username already taken' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username,email,password,full_name,role) VALUES (?,?,?,?,?)',
            [username, email, hashedPassword, full_name, 'user']
        );
        res.status(201).json({ success: true, message: 'Registered successfully', userId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// Login User
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!users.length) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!users.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: users[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify Token
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: { id: req.user.id, username: req.user.username, role: req.user.role }
    });
});

module.exports = router;
