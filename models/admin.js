require('../db/mongoose');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const adminSchema = new mongoose.Schema({

    user_name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 5,
        validate(value) {
            const regex = /[^a-zA-Z0-9\_]/

            if (regex.test(value)) {
                throw new Error('username must not inculde special charecters')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    },
    role: {
        type: String,
        default: 'Admin',
        enum: {
            values: ['Admin'],
            message: 'value not supported'
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

adminSchema.methods.toJSON = function () {
    const admin = this
    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens

    return adminObject
}


adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, 'thisisadmin')

    admin.tokens = admin.tokens.concat({ token })
    await admin.save()

    return token
}


adminSchema.statics.findByCredentials = async (user_name, password) => {
    const admin = await Admin.findOne({ user_name })
    if (!admin) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin
}


adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    next()
})



const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;