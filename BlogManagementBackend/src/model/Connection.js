const mongoose = require("mongoose")

const connectionSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted"],
            default: "pending"
        }
    },
    { timestamps: true }
)

// Prevent duplicate connection requests in the same direction
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true })

module.exports.Connection = mongoose.model("connection", connectionSchema)
