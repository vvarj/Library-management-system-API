const Book = require('../models/book')


const orderBook = async (book_id) => {
    
    let book = await Book.findOne({ book_id })
        if (book === null) {
            return new Error('No book found')
        }

        if (book.available === false) {
            return new Error('Book not Availabe')
        }


    book.available = false;

    await book.save();

    return book;
}

module.exports = orderBook