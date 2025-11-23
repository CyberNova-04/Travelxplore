const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const packageRoutes = require('./routes/packageRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

const app = express();

// CORS
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// SPA Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/destinations', (req, res) => res.sendFile(path.join(__dirname, 'views', 'destinations.html')));
app.get('/packages', (req, res) => res.sendFile(path.join(__dirname, 'views', 'packages.html')));
app.get('/package/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'package-detail.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));

// Admin pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html')));
app.get('/admin/destinations', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin', 'destinations.html')));
app.get('/admin/packages', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin', 'packages.html')));
app.get('/admin/add-destination', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin', 'add-destination.html')));
app.get('/admin/add-package', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin', 'add-package.html')));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running!' }));

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📚 Admin: http://localhost:${PORT}/admin`);
    console.log('=================================');
});
