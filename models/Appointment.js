const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: true
    },
    employee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },
    qrCode: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);