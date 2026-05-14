const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PassSchema = new Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: true
    },
    passNumber: {
        type: String,
        unique: true,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now()
    },
    validTill: {
        type: Date,
        required: true
    },
    pdfUrl: {
        type: String
    },
    qrCode: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Pass', PassSchema);