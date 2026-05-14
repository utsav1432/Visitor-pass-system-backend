const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullName: {
        type: String,
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
    office: {
        type: String,
        required: true
    },
    role: {
      type: String,
      enum: ["admin", "security", "employee"],
      default: "employee"
    },
    password: {
        type: String,
        required: true
    },
    verifiedOTP: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);