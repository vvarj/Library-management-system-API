const Book = require('../models/book')
const History = require('../models/history')

const returnBook = async (book_id,user) => {
    let searchid=book_id;
    let book = await Book.findOne({ book_id })

    if (!book) {
        return new Error('No book Found')
    }


    book.available = true;

    user.books_borrowed = user.books_borrowed.filter((object) => {
            return object.book_id !== searchid
        })

    let history = await History.findOne({ book_id ,'borrowed_by':user._id,'returned':false})
    console.log('hi buddy ',history);
    history.returned=true;

    await user.save();

   await book.save();
   await history.save();

    return book;
}

module.exports = returnBook