const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all destinations
router.get('/', async (req, res) => {
    const { featured, country, search, limit = 50 } = req.query;
    let sql = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];
    if (featured === 'true') { sql += ' AND featured=1'; }
    if (country) { sql += ' AND country=?'; params.push(country); }
    if (search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR country LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    try {
        const [destinations] = await db.query(sql, params);
        res.json({ success: true, count: destinations.length, destinations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single destination
router.get('/:id', async (req, res) => {
    try {
        const [dest] = await db.query('SELECT * FROM destinations WHERE id=?', [req.params.id]);
        if (!dest.length) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        const [packages] = await db.query('SELECT * FROM packages WHERE destination_id=? LIMIT 10', [req.params.id]);
        res.json({ success: true, destination: dest[0], packages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create destination
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, country, description, short_description, price, rating, featured } = req.body;
    if (!name || !country || !description || !price) {
        return res.status(400).json({ success: false, message: 'Name, country, description, price required' });
    }
    const imageUrl = req.file ? `/images/uploads/${req.file.filename}` : null;
    try {
        const [result] = await db.query(
            'INSERT INTO destinations (name,country,description,short_description,image,price,rating,featured) VALUES (?,?,?,?,?,?,?,?)',
            [name, country, description, short_description || '', imageUrl, price, rating||5.0, featured==='true'?1:0]
        );
        res.status(201).json({ success: true, message: 'Created successfully', destinationId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update destination
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { name, country, description, short_description, price, rating, featured } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM destinations WHERE id=?', [req.params.id]);
        if (!existing.length) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const dest = existing[0];
        const imageUrl = req.file ? `/images/uploads/${req.file.filename}` : dest.image;
        await db.query(
            `UPDATE destinations SET name=?,country=?,description=?,short_description=?,image=?,price=?,rating=?,featured=? WHERE id=?`,
            [
                name||dest.name, country||dest.country, description||dest.description,
                short_description||dest.short_description,
                imageUrl,
                price||dest.price, rating||dest.rating,
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

// Delete destination
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM destinations WHERE id=?', [req.params.id]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Countries filter
router.get('/filter/countries', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT country FROM destinations ORDER BY country');
        res.json({ success: true, countries: rows.map(r => r.country) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
