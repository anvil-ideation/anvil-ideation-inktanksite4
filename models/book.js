const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    author: {
        type: String,
        required: true,
        unique: true,
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
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: true,
        min: 1,
    },
    release: {
        type: Date,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    comments: [commentSchema],
    ratings: [ratingSchema],
}, {
    timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;