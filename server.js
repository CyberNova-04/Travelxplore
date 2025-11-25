require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/views', express.static('views'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/destinations', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'destinations.html'));
});

app.get('/packages', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'packages.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/package/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'package-detail.html'));
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/destinations', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'destinations.html'));
});

app.get('/admin/packages', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'packages.html'));
});

app.get('/admin/add-destination', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'add-destination.html'));
});

app.get('/admin/add-package', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'add-package.html'));
});

app.get('/admin/edit-destination', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'edit-destination.html'));
});

app.get('/admin/edit-package', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'edit-package.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running!' });
});

// 404 handler
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📚 Admin: http://localhost:${PORT}/admin`);
    console.log('=================================');
});