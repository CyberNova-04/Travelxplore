const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. Please login.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Verify admin role
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
