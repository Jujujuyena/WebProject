const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./auth');
const productRoutes = require('./products');
const orderRoutes = require('./orders');

// Initialize Express App
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Flower Shop API',
        status: 'Server is running',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Check if payment and upload routes exist
try {
    const paymentRoutes = require('./payment');
    app.use('/api/payment', paymentRoutes);
    console.log('✅ Payment routes loaded');
} catch (error) {
    console.log('⚠️  Payment routes not found');
}

try {
    const uploadRoutes = require('./upload');
    app.use('/api/upload', uploadRoutes);
    console.log('✅ Upload routes loaded');
} catch (error) {
    console.log('⚠️  Upload routes not found');
}

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));


// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
});
// Chat Route
try {
    const chatRoutes = require('./chatRoute');
    app.use('/api/chat', chatRoutes);
    console.log("✅ Chat route loaded");
} catch (err) {
    console.log("⚠️ Chat route not found");
}
