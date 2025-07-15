// qr-digital-menu-system/backend/models/Store.js

const mongoose = require('mongoose');

const storeSchema = mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // Each admin can only have one store
        },
        name: {
            type: String,
            required: [true, 'Please add a store name'],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        logo: {
            type: String, // URL from Cloudinary
            default: '',
        },
        // New fields for store description and social media links
        description: {
            type: String,
            trim: true,
            default: '',
        },
        facebookUrl: {
            type: String,
            trim: true,
            default: '',
        },
        telegramUrl: {
            type: String,
            trim: true,
            default: '',
        },
        tiktokUrl: {
            type: String,
            trim: true,
            default: '',
        },
        websiteUrl: {
            type: String,
            trim: true,
            default: '',
        },
        // We'll generate a unique ID for the public menu link, separate from _id
        publicUrlId: {
            type: String,
            unique: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
