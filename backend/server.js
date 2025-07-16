// qr-digital-menu-system/backend/server.js

const express = require('express');
const dotenv = require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // MongoDB connection
const connectCloudinary = require('./config/cloudinary'); // Cloudinary connection
const path = require('path'); // Node.js built-in module for path manipulation
const helmet = require('helmet'); // For setting security-related HTTP headers

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

// Connect to database
connectDB();

// Connect to Cloudinary
connectCloudinary();

const app = express();

// --- Middleware ---

// Configure CORS for specific origins and methods
// It's crucial to allow your Render frontend URL as an origin.
// For development, you can keep localhost.
const corsOptions = {
    origin: [
        'http://localhost:5000', // Your local development frontend
        'https://menu-qr-61oz.onrender.com', // Your deployed Render frontend URL
        // Add any other domains that need to access your API
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Implement Helmet for basic security headers, including a default CSP
// This helps prevent common attacks like XSS and clickjacking.
// We'll customize CSP to allow necessary CDNs.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"], // Allow Tailwind and QRious CDN
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"], // Allow Google Fonts and Font Awesome
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"], // Allow Google Fonts and data URIs for icons
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://placehold.co"], // Allow Cloudinary images and placeholders
            connectSrc: ["'self'", "https://generativelanguage.googleapis.com"], // Allow Gemini API calls if used
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [], // Automatically convert HTTP to HTTPS
        },
    },
    // You can disable specific headers if they cause issues, e.g.:
    // crossOriginEmbedderPolicy: false,
}));


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
