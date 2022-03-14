const Book = require('../models/book')
const History = require('../models/history')


const orderBook = async (book_id,user) => {
    
    let book = await Book.findOne({ book_id })
        if (book === null) {
            return new Error('No book found')
        }

        if (book.available === false) {
            return new Error('Book not Availabe')
        }


    
        console.log(book);

   let history = new History({
        'book_id':book.book_id,
        'author':book.author,
        'title':book.title,
        'borrowed_by':user._id,
        'returned':false
    })


    book.available = false;
    await user.books_borrowed.push(book)
    console.log(history);
   await history.save();
   await user.save();
    await book.save();

    return book;
}

module.exports = orderBook