// qr-digital-menu-system/backend/server.js

const express = require('express');
const dotenv = require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // MongoDB connection
const connectCloudinary = require('./config/cloudinary'); // Cloudinary connection
const path = require('path'); // Node.js built-in module for path manipulation

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

// Connect to database
connectDB();

// --- TEMPORARY: ONE-TIME SUPERADMIN REGISTRATION SCRIPT (REMOVED) ---
// The superadmin has already been created as per your server logs.
// This script block has been removed for security and clean operation.
// If you need to reset or create a new superadmin, you should do so
// manually via MongoDB Compass/Atlas, or by temporarily re-adding
// a controlled registration route, or managing through the admin panel.

// Connect to Cloudinary
connectCloudinary();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

// API Routes - These should be placed before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// --- Serve Frontend Static Files ---
// This middleware will serve all your HTML, CSS, JS, and other static assets
// It should come AFTER your API routes to ensure API calls are not intercepted by static files
app.use(express.static(path.join(__dirname, '../frontend')));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
