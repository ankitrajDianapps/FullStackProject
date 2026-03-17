const mongoose = require("mongoose")

const savedPostSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
            required: true
        }
    },
    { timestamps: true }
)

// Prevent a user from saving the same post twice
savedPostSchema.index({ user: 1, post: 1 }, { unique: true })

module.exports.SavedPost = mongoose.model("savedpost", savedPostSchema)
