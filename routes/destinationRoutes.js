const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed!'));
        }
    }
});

// GET all destinations
router.get('/', async (req, res) => {
    try {
        const [destinations] = await db.execute('SELECT * FROM destinations ORDER BY id DESC');
        res.json({ success: true, destinations });
    } catch (err) {
        console.error('Get destinations error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST add destination
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, country, description, full_description, price, rating, featured } = req.body;
    
    if (!name || !country || !description || !price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image is required' });
    }
    
    const imagePath = '/uploads/' + req.file.filename;
    const isFeatured = featured === '1' || featured === 'true';
    const finalFullDesc = full_description || description;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO destinations (name, country, description, full_description, price, rating, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, country, description, finalFullDesc, price, rating || 5.0, imagePath, isFeatured]
        );
        
        res.json({ 
            success: true, 
            message: 'Destination added successfully!', 
            destinationId: result.insertId 
        });
    } catch (err) {
        console.error('Add destination error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// GET single destination by ID
router.get('/:id', async (req, res) => {
    try {
        const [destinations] = await db.execute('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
        
        if (!destinations.length) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        
        res.json({ success: true, destination: destinations[0] });
    } catch (err) {
        console.error('Get destination error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT update destination
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, country, description, full_description, price, rating, featured } = req.body;
    
    if (!name || !country || !description || !price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const isFeatured = featured === '1' || featured === 'true';
    const finalFullDesc = full_description || description;
    
    try {
        // Build query dynamically based on whether image was uploaded
        let query, params;
        
        if (req.file) {
            const imagePath = '/uploads/' + req.file.filename;
            query = 'UPDATE destinations SET name=?, country=?, description=?, full_description=?, price=?, rating=?, image=?, featured=? WHERE id=?';
            params = [name, country, description, finalFullDesc, price, rating || 5.0, imagePath, isFeatured, req.params.id];
        } else {
            query = 'UPDATE destinations SET name=?, country=?, description=?, full_description=?, price=?, rating=?, featured=? WHERE id=?';
            params = [name, country, description, finalFullDesc, price, rating || 5.0, isFeatured, req.params.id];
        }
        
        const [result] = await db.execute(query, params);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        
        res.json({ success: true, message: 'Destination updated successfully!' });
    } catch (err) {
        console.error('Update destination error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// DELETE destination
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM destinations WHERE id = ?', [req.params.id]);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        
        res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
