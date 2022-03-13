const express = require('express')
const Admin = require('../models/admin')
const adminAuth = require('../middleware/adminAuth')
const router = new express.Router()
const Book = require('../models/book')


router.post('/admin', async (req, res) => {
    try {
        const admin = new Admin(req.body)
        const token = await admin.generateAuthToken()

        await admin.save()
        res.status(201).send({ admin,token })

    } catch (e) {
        res.status(400).send({error:'user already exist or incorrect details'})
    }
})

router.post('/admin/login', async (req, res) => {

    try {
        const admin = await Admin.findByCredentials(req.body.user_name, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin,token})

    } catch (e) {
        res.status(400).send({error:'incorrect details'})
    }
})

router.get('/admin/me', adminAuth, async (req, res) => {
    res.send(req.admin)
})


router.post('/admin/logout', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res.send({message:'logged out'})
        
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})

router.post('/admin/logoutAll', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send({message:'logged out from all devices'})
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})

router.delete('/admin/me', adminAuth, async (req, res) => {
    try {
        await req.admin.remove()
        res.send({message:'account deleted'})
    } catch (e) {
        res.status(500).send({error:'something went wrong'})
    }
})

router.post('/admin/me/books', adminAuth, async (req, res) => {

    const book = new Book({
        ...req.body
    })
    try {
        await book.save()
        res.status(201).send({message:'Book Added !',book})
    } catch (e) {
        res.status(400).send({error:'something went wrong',e})
    }
})


router.get('/admin/me/books', adminAuth, async (req, res) => {

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

router.get('/admin/me/books/:book_id', adminAuth, async (req, res) => {
    const book_id = req.params.book_id
    try {
        const book = await Book.findOne({ book_id });

        if (!book) {
            return res.status(404).send({ message: 'Book Not Found' });
        }

        res.send(book);

    } catch (e) {
        res.status(500).send({ error: 'something went wrong'})
    }

})

router.patch('/admin/me/books/:book_id', adminAuth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'author', 'available']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const book = await Book.findOne({ book_id: req.params.book_id })

        if (!book) {
            return res.status(404).send({ error: 'Cannot find book to update' })
        }

        updates.forEach((update) => book[update] = req.body[update])
        await book.save()
        res.send({message:"Book Updated !",book})

    } catch (e) {
        res.status(400).send({ error: 'Please enter valid details' })
    }
})


module.exports = router;