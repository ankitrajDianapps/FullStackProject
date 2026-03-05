const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String (email)
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // This will automatically delete the document when it expires
    }
}, { timestamps: true });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = { OTP };
