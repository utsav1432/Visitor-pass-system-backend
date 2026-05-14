const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VisitorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true
    },
    purpose: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);