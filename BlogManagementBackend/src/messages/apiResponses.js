const { model } = require("mongoose")

const messages = {
    INVALID_ID_FORMAT: "Invalid Id format",
    UNAUTHORIZED_ACTION: "You are not authorized to perform this action",

    USER_NOT_FOUND: "User not found with this Id",
    USER_ID_REQUIRED: "User ID is required",

    POST_NOT_FOUND: "Post not found with this Id",
    DRAFT_POST_NOT_FOUND: "Draft post not found , either deleted or already published",
    POST_ID_REQUIRED: "Post ID is required",


    COMMENT_NOT_FOUND: "Comment not found with this Id",
    COMMENT_ID_REQUIRED: "Comment ID is required",

    SAVED_POST_NOT_FOUND: "Post is not in your saved list",
    POST_ALREADY_SAVED: "Post is already saved",

    CONNECTION_NOT_FOUND: "Connection not found",
    CANNOT_CONNECT_SELF: "You cannot connect with yourself",
    CONNECTION_ALREADY_EXISTS: "A connection request already exists between these users"
}

module.exports.messages = messages

