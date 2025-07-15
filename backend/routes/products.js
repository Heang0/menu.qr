// qr-digital-menu-system/backend/routes/products.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category'); // Need to check if category exists and belongs to store
const Store = require('../models/Store');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to get the admin's store ID and ensure they own it
const getAdminStoreId = async (req, res, next) => {
    try {
        const store = await Store.findOne({ admin: req.user._id });
        if (!store) {
            return res.status(404).json({ message: 'No store found for this admin.' });
        }
        req.storeId = store._id; // Attach storeId to the request
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin store.', error: error.message });
    }
};

// @desc    Add a new product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, authorizeRoles('admin'), getAdminStoreId, upload.single('image'), async (req, res) => {
    const { title, description, price, category } = req.body;

    if (!title || !category) {
        return res.status(400).json({ message: 'Please add product title and select a category' });
    }

    try {
        // Verify category exists and belongs to the admin's store
        const existingCategory = await Category.findOne({ _id: category, store: req.storeId });
        if (!existingCategory) {
            return res.status(400).json({ message: 'Invalid category or category does not belong to your store.' });
        }

        let imageUrl = '';
        if (req.file) {
            const uploadRes = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'qr_digital_menu_products', // Specific folder for products
                    resource_type: 'image',
                    quality: 'auto',
                    fetch_format: 'auto'
                }
            );
            imageUrl = uploadRes.secure_url;
        }

        const product = await Product.create({
            title,
            description,
            price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : undefined, // Handle optional price
            image: imageUrl,
            category: existingCategory._id,
            store: req.storeId,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all products for the authenticated admin's store
// @route   GET /api/products/my-store
// @access  Private (Admin only)
router.get('/my-store', protect, authorizeRoles('admin'), getAdminStoreId, async (req, res) => {
    try {
        const products = await Product.find({ store: req.storeId }).populate('category', 'name').sort('title');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all products for a public store (by store ID)
// @route   GET /api/products/store/:storeId
// @access  Public
router.get('/store/:storeId', async (req, res) => {
    try {
        const products = await Product.find({ store: req.params.storeId }).populate('category', 'name').sort('title');
        res.json(products);
    } catch (error) {
        // If it's a CastError (invalid ObjectId format), treat as not found
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Invalid Store ID.' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), getAdminStoreId, upload.single('image'), async (req, res) => {
    const { title, description, price, category } = req.body;

    try {
        const product = await Product.findOne({ _id: req.params.id, store: req.storeId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you do not own this product.' });
        }

        // Verify category if it's being updated
        if (category) {
            const existingCategory = await Category.findOne({ _id: category, store: req.storeId });
            if (!existingCategory) {
                return res.status(400).json({ message: 'Invalid category or category does not belong to your store.' });
            }
            product.category = existingCategory._id;
        }

        product.title = title || product.title;
        product.description = description !== undefined ? description : product.description; // Allow clearing description
        product.price = price !== undefined && price !== null && price !== '' ? parseFloat(price) : null; // Allow clearing price

        // Handle image update
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (product.image) {
                const publicId = product.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadRes = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'qr_digital_menu_products',
                    resource_type: 'image',
                    quality: 'auto',
                    fetch_format: 'auto'
                }
            );
            product.image = uploadRes.secure_url;
        } else if (req.body.image === '') { // Allow frontend to send empty string to remove image
            if (product.image) {
                const publicId = product.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            product.image = '';
        }


        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), getAdminStoreId, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, store: req.storeId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you do not own this product.' });
        }

        // Delete image from Cloudinary if it exists
        if (product.image) {
            const publicId = product.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Product.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 6+

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;