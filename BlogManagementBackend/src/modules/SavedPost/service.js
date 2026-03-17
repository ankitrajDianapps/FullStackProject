const mongoose = require("mongoose")
const AppError = require("../../utils/AppError.js")
const { logger } = require("../../utils/logging.js")
const savedLogger = logger.child({ module: "savedPostService" })
const { Post } = require("../../model/Post.js")
const { SavedPost } = require("../../model/SavedPost.js")
const { messages } = require("../../messages/apiResponses.js")


const savePost = async (postId, user) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const post = await Post.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // Check if already saved
        const alreadySaved = await SavedPost.findOne({ user: user._id, post: postId })
        if (alreadySaved) throw new AppError(messages.POST_ALREADY_SAVED, 409)

        const saved = await SavedPost.create({ user: user._id, post: postId })
        return saved

    } catch (err) {
        savedLogger.error(err.message, { function: "savePost" })
        throw new AppError(err.message, err.statusCode)
    }
}


const unsavePost = async (postId, user) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const saved = await SavedPost.findOneAndDelete({ user: user._id, post: postId })
        if (!saved) throw new AppError(messages.SAVED_POST_NOT_FOUND, 404)

        return

    } catch (err) {
        savedLogger.error(err.message, { function: "unsavePost" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getSavedPosts = async (user) => {
    try {
        const savedPosts = await SavedPost.find({ user: user._id })
            .populate({
                path: "post",
                select: "title slug excerpt featuredImage author publishedAt category tags viewCount",
                populate: {
                    path: "author",
                    select: "fullName userName avatar"
                }
            })
            .sort({ createdAt: -1 })

        // Filter out any orphaned refs (post was deleted after saving)
        const validSaved = savedPosts.filter(s => s.post !== null)
        return validSaved.map(s => s.post)

    } catch (err) {
        savedLogger.error(err.message, { function: "getSavedPosts" })
        throw new AppError(err.message, err.statusCode)
    }
}


const isPostSaved = async (postId, user) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const saved = await SavedPost.findOne({ user: user._id, post: postId })
        return !!saved

    } catch (err) {
        savedLogger.error(err.message, { function: "isPostSaved" })
        throw new AppError(err.message, err.statusCode)
    }
}


module.exports = { savePost, unsavePost, getSavedPosts, isPostSaved }
