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

// ✅ GET all packages - FIXED
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Fetching all packages...');
        
        const [packages] = await db.execute(`
            SELECT 
                p.id,
                p.title,
                p.destination_id,
                p.duration_days,
                p.price,
                p.description,
                p.image,
                p.featured,
                p.rating,
                p.max_guests,
                p.inclusions,
                p.exclusions,
                d.name as destination_name,
                d.country
            FROM packages p 
            LEFT JOIN destinations d ON p.destination_id = d.id 
            ORDER BY p.featured DESC, p.id DESC
        `);
        
        console.log(`✅ Found ${packages.length} packages`);
        if (packages.length > 0) {
            console.log('📦 Sample:', {
                id: packages[0].id,
                title: packages[0].title,
                duration_days: packages[0].duration_days,
                max_guests: packages[0].max_guests
            });
        }
        
        res.json({ 
            success: true, 
            packages: packages 
        });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + err.message 
        });
    }
});

// ✅ GET single package by ID - FIXED
router.get('/:id', async (req, res) => {
    try {
        const [packages] = await db.execute(`
            SELECT 
                p.id,
                p.title,
                p.destination_id,
                p.duration_days,
                p.price,
                p.description,
                p.inclusions,
                p.exclusions,
                p.image,
                p.rating,
                p.max_guests,
                p.featured,
                d.name as destination_name,
                d.country 
            FROM packages p 
            LEFT JOIN destinations d ON p.destination_id = d.id 
            WHERE p.id = ?
        `, [req.params.id]);
        
        if (!packages.length) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        
        console.log('✅ Package found:', packages[0].title);
        
        // Get related packages
        const [relatedPackages] = await db.execute(`
            SELECT 
                p.id,
                p.title,
                p.duration_days,
                p.price,
                p.image,
                d.name as destination_name
            FROM packages p
            LEFT JOIN destinations d ON p.destination_id = d.id
            WHERE p.destination_id = ? AND p.id != ?
            LIMIT 3
        `, [packages[0].destination_id, req.params.id]);
        
        res.json({ 
            success: true, 
            package: packages[0],
            relatedPackages: relatedPackages
        });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST create package
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, destination_id, duration, price, description, featured, max_guests, inclusions, exclusions } = req.body;
    
    if (!name || !destination_id || !duration || !price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const isFeatured = featured === '1' || featured === 'true';
    const imagePath = req.file ? '/uploads/' + req.file.filename : null;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO packages (title, destination_id, duration_days, price, description, image, featured, max_guests, inclusions, exclusions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, destination_id, duration, price, description, imagePath, isFeatured, max_guests || 10, inclusions || '', exclusions || '']
        );
        
        res.json({ success: true, message: 'Package created!', id: result.insertId });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// PUT update package
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, destination_id, duration, price, description, featured, max_guests, inclusions, exclusions } = req.body;
    
    if (!name || !destination_id || !duration || !price || !description) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const isFeatured = featured === '1' || featured === 'true';
    
    try {
        let query, params;
        
        if (req.file) {
            const imagePath = '/uploads/' + req.file.filename;
            query = 'UPDATE packages SET title=?, destination_id=?, duration_days=?, price=?, description=?, image=?, featured=?, max_guests=?, inclusions=?, exclusions=? WHERE id=?';
            params = [name, destination_id, duration, price, description, imagePath, isFeatured, max_guests || 10, inclusions || '', exclusions || '', req.params.id];
        } else {
            query = 'UPDATE packages SET title=?, destination_id=?, duration_days=?, price=?, description=?, featured=?, max_guests=?, inclusions=?, exclusions=? WHERE id=?';
            params = [name, destination_id, duration, price, description, isFeatured, max_guests || 10, inclusions || '', exclusions || '', req.params.id];
        }
        
        const [result] = await db.execute(query, params);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        
        res.json({ success: true, message: 'Package updated!' });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// DELETE package
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM packages WHERE id = ?', [req.params.id]);
        
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        
        res.json({ success: true, message: 'Package deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;