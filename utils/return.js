const Book = require('../models/book')

const returnBook = async (book_id) => {

    let book = await Book.findOne({ book_id })

    if (!book) {
        return new Error('No book Found')
    }


    book.available = true;

    await book.save();

    return book;
}

module.exports = returnBook