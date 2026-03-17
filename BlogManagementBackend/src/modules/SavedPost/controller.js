const savedPostService = require("./service.js")
const { apiResponse } = require("../../config/responseHandler.js")


module.exports.savePost = async (req, res) => {
    try {
        const saved = await savedPostService.savePost(req.params.postId, req.user)

        return apiResponse({
            res,
            code: 201,
            message: "Post saved successfully",
            status: true,
            data: saved
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.unsavePost = async (req, res) => {
    try {
        await savedPostService.unsavePost(req.params.postId, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Post removed from saved list",
            status: true
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.getSavedPosts = async (req, res) => {
    try {
        const posts = await savedPostService.getSavedPosts(req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Saved posts fetched successfully",
            status: true,
            data: posts
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.isPostSaved = async (req, res) => {
    try {
        const isSaved = await savedPostService.isPostSaved(req.params.postId, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Save status fetched",
            status: true,
            data: { isSaved }
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}
