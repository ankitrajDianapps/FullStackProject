const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        type: {
            type: String,
            enum: ['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'LIKE', 'COMMENT', 'SYSTEM'],
            required: true
        },
        // A generic relation ID: could be a Connection doc ID or Post doc ID etc.
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            // we do not use strict ref since it could be polymorphic
        },
        message: {
            type: String,
            default: ""
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports.Notification = mongoose.model("Notification", notificationSchema);
