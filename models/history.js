const mongoose = require('mongoose');


const historySchema = new mongoose.Schema({

    book_id: {
        type: Number,
        required: true,
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
    returned: {
        type: Boolean,
        default: true
    },
    borrowed_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

}, { timestamps: true })



const History = mongoose.model('History', historySchema);
module.exports = History;