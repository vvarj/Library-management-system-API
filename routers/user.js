const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const orderBook = require('../utils/order')
const returnBook = require('../utils/return')
const Book = require('../models/book')
const History = require('../models/history')
const router = new express.Router()


router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()

        await user.save()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(400).send({error:'user already exist or incorrect details'})
    }
})


router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token })

    } catch (e) {
        res.status(400).send({ error: 'incorrect details' })
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send({message:'logged out!'})
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send({message:'logged out from all devices'})
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})

//shows all details including the book he purchased

router.get('/users/me', auth, async (req, res) => {
    try{
        res.send(req.user)
    }catch(e){
        res.status(500).send({error:'something went wrong'})
    }
    
})
/// show books purchased , yet to return

router.get('/users/me/mybooks', auth, async (req, res) => {
    try{
        res.send(req.user.books_borrowed)
    }catch(e){
        res.status(500).send({error:'something went wrong'})
    }
})



router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})


router.post('/users/me/placeOrder', auth, async (req, res) => {
    try {
        const book_id = parseInt(req.body.book_id)
        const orderdBook = await orderBook(book_id,req.user)

        res.send({
            message: 'book borrowed !',
            title: orderdBook.title,
            book_id: orderdBook.book_id
        })

    }
    catch (e) {
        res.status(500).send({ error: 'Not Available' ,e})
    }

})

router.post('/users/me/returnBook', auth, async (req, res) => {
    try {
        const searchid = parseInt(req.body.book_id)

        const found = req.user.books_borrowed.find((object) => {
            return object.book_id == searchid
        })

        if (!found) {
            return res.status(500).send({ error: 'Not ordered' })
        }


        const book1 = await returnBook(searchid,req.user)

        // req.user.books_borrowed = req.user.books_borrowed.filter((object) => {
        //     return object.book_id !== searchid
        // })

        //await req.user.save()
        res.send({message:'Book returned !',book1});
    }

    catch (e) {
        res.status(500).send({ error: 'Something went Wrong' ,e})
    }

})

router.get('/users/me/books', auth, async (req, res) => {

    let { page, size } = req.query
    let search = {}

    if ((!page) || (!size)) {
        search = req.query
    }


    if (!page) {
        page = 1;
    }
    if (!size) {
        size = 3;
    }

    const limit = parseInt(size)
    const skip = (page - 1) * size


    try {
        const books = await Book.find(search).limit(limit).skip(skip);

        if (!books) {
            return res.status(404).send({ message: 'Book list empty' });
        }
        res.send({
            page, size,
            books
        });

    } catch (e) {
        res.status(500).send({ message: 'something went wrong' })
    }


})

router.get('/users/me/books/:book_id', auth, async (req, res) => {
    const book_id = req.params.book_id
    try {
        const book = await Book.findOne({ book_id });

        if (!book) {
            return res.status(404).send({ message: 'Book Not Found' });
        }
        res.send(book);

    } catch (e) {
        res.status(500).send({ message: 'something went wrong' })
    }

})

// to find history of user
/// GET /users/me/history?page=1&size=1 
router.get('/users/me/history', auth, async (req, res) => {

    let { page, size } = req.query
    let search = {}

    if ((!page) || (!size)) {
        search = req.query
    }


    if (!page) {
        page = 1;
    }
    if (!size) {
        size = 3;
    }

    const limit = parseInt(size)
    const skip = (page - 1) * size


    try {

        const history = await History.find({borrowed_by:req.user._id}).limit(limit).skip(skip);

        if (!history) {
            return res.status(404).send({ message: 'Empty Records' });
        }
        res.send({
            page, size,
            history
        });

    } catch (e) {
        res.status(500).send({ message: 'something went wrong' })
    }

    
})


module.exports = router