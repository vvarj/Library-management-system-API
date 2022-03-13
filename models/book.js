const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({

    book_id: {
        type: Number,
        required: true,
        unique: true,
        trim: true,

        validate(value) {

            if (value < 0) {
                throw new Error('Book ID must be a postive number')
            }

        }

    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;