const mongoose = require('mongoose');
const { schema } = require('./Visitor');

const Schema = mongoose.Schema;

const CheckInOutSchema = new Schema({
    pass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pass',
        required: true
    },
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    visitorName: {
        type: String
    },
    visitorEmail: {
        type: String
    },
    visitorMobileNo: {
        type: String
    },
    visitorPurpose: {
        type: String
    },
    visitDate: {
        type: Date
    },
    visitTime: {
        type: String
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'checked-in', 'checked-out'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

CheckInOutSchema.index({ pass: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'checked-in' } });

module.exports = mongoose.model('CheckInOut', CheckInOutSchema);