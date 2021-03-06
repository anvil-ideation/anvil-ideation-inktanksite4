const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const socialSchema = new Schema({
    channel: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const bioSchema = new Schema({
    location: {
        type: String,
        required: true,
    },
    review: {
        type: String,
    },
    reviewAuthor: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    portfolio: {
        type: String,
    },
    social: [socialSchema],
}, {
    timestamps: true,
});

const ratingSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const authorSchema = new Schema({
    
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    comments: [commentSchema],
    ratings: [ratingSchema],
    bio: [bioSchema],
}, {
    timestamps: true,
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;