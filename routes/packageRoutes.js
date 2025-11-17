const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all packages
router.get('/', async (req, res) => {
    const { featured, destination_id, min_price, max_price, search, limit = 50 } = req.query;
    let sql = `
        SELECT p.*, d.name AS destination_name, d.country 
        FROM packages p 
        LEFT JOIN destinations d ON p.destination_id=d.id
        WHERE 1=1
    `;
    const params = [];
    if (featured==='true') { sql += ' AND p.featured=1'; }
    if (destination_id) { sql += ' AND p.destination_id=?'; params.push(destination_id); }
    if (min_price)     { sql += ' AND p.price>=?'; params.push(parseFloat(min_price)); }
    if (max_price)     { sql += ' AND p.price<=?'; params.push(parseFloat(max_price)); }
    if (search) {
        sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR d.name LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
    }
    sql += ' ORDER BY p.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    try {
        const [packages] = await db.query(sql, params);
        res.json({ success: true, count: packages.length, packages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single package
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, d.name AS destination_name, d.country, d.image AS destination_image
             FROM packages p 
             LEFT JOIN destinations d ON p.destination_id=d.id
             WHERE p.id=?`, 
            [req.params.id]
        );
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const pkg = rows[0];
        const [related] = await db.query(
            'SELECT * FROM packages WHERE destination_id=? AND id<>? LIMIT 4', 
            [pkg.destination_id, req.params.id]
        );
        res.json({ success: true, package: pkg, relatedPackages: related });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create package
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const {
        destination_id, title, description,
        duration_days, price, inclusions, exclusions,
        rating, max_guests, featured
    } = req.body;
    if (!destination_id||!title||!description||!duration_days||!price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {
        const [dest] = await db.query('SELECT id FROM destinations WHERE id=?', [destination_id]);
        if (!dest.length) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        const imageUrl = req.file ? `/images/uploads/${req.file.filename}` : null;
        const [result] = await db.query(
            `INSERT INTO packages 
             (destination_id,title,description,duration_days,price,inclusions,exclusions,image,rating,max_guests,featured) 
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                destination_id, title, description, duration_days, price,
                inclusions||'', exclusions||'', imageUrl,
                rating||5.0, max_guests||10, featured==='true'?1:0
            ]
        );
        res.status(201).json({ success: true, message: 'Created successfully', packageId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update package
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const {
        destination_id, title, description,
        duration_days, price, inclusions, exclusions,
        rating, max_guests, featured
    } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM packages WHERE id=?', [req.params.id]);
        if (!existing.length) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const pkg = existing[0];
        const imageUrl = req.file ? `/images/uploads/${req.file.filename}` : pkg.image;
        await db.query(
            `UPDATE packages SET
             destination_id=?, title=?, description=?, duration_days=?,
             price=?, inclusions=?, exclusions=?, image=?, rating=?, max_guests=?, featured=?
             WHERE id=?`,
            [
                destination_id||pkg.destination_id,
                title||pkg.title,
                description||pkg.description,
                duration_days||pkg.duration_days,
                price||pkg.price,
                inclusions||pkg.inclusions,
                exclusions||pkg.exclusions,
                imageUrl,
                rating||pkg.rating,
                max_guests||pkg.max_guests,
                featured==='true'?1:0,
                req.params.id
            ]
        );
        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete package
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM packages WHERE id=?', [req.params.id]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Packages by destination
router.get('/destination/:destination_id', async (req, res) => {
    try {
        const [packages] = await db.query(
            `SELECT p.*, d.name AS destination_name, d.country
             FROM packages p
             LEFT JOIN destinations d ON p.destination_id=d.id
             WHERE p.destination_id=?
             ORDER BY p.created_at DESC`,
            [req.params.destination_id]
        );
        res.json({ success: true, count: packages.length, packages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
