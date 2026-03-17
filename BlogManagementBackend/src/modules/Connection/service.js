const mongoose = require("mongoose")
const AppError = require("../../utils/AppError.js")
const { logger } = require("../../utils/logging.js")
const connectionLogger = logger.child({ module: "connectionService" })
const { Connection } = require("../../model/Connection.js")
const { messages } = require("../../messages/apiResponses.js")


const sendRequest = async (requesterId, recipientId) => {
    try {
        if (requesterId.toString() === recipientId.toString())
            throw new AppError(messages.CANNOT_CONNECT_SELF, 400)

        if (!mongoose.Types.ObjectId.isValid(recipientId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        // Check if any connection already exists in either direction
        const existing = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        })
        if (existing) throw new AppError(messages.CONNECTION_ALREADY_EXISTS, 409)

        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId
        })

        return connection

    } catch (err) {
        connectionLogger.error(err.message, { function: "sendRequest" })
        throw new AppError(err.message, err.statusCode)
    }
}


const acceptRequest = async (connectionId, userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(connectionId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const connection = await Connection.findById(connectionId)
        if (!connection) throw new AppError(messages.CONNECTION_NOT_FOUND, 404)

        // Only the recipient can accept
        if (connection.recipient.toString() !== userId.toString())
            throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        connection.status = "accepted"
        await connection.save()

        return connection

    } catch (err) {
        connectionLogger.error(err.message, { function: "acceptRequest" })
        throw new AppError(err.message, err.statusCode)
    }
}


const removeConnection = async (viewerId, profileUserId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(profileUserId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        // Delete regardless of direction (either can remove)
        const result = await Connection.findOneAndDelete({
            $or: [
                { requester: viewerId, recipient: profileUserId },
                { requester: profileUserId, recipient: viewerId }
            ]
        })

        if (!result) throw new AppError(messages.CONNECTION_NOT_FOUND, 404)
        return

    } catch (err) {
        connectionLogger.error(err.message, { function: "removeConnection" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getConnections = async (userId) => {
    try {
        const connections = await Connection.find({
            $or: [
                { requester: userId, status: "accepted" },
                { recipient: userId, status: "accepted" }
            ]
        })
            .populate("requester", "fullName userName avatar role")
            .populate("recipient", "fullName userName avatar role")
            .sort({ updatedAt: -1 })

        // Return the "other" user in each connection
        return connections.map(conn => {
            const isRequester = conn.requester._id.toString() === userId.toString()
            return {
                connectionId: conn._id,
                connectedAt: conn.updatedAt,
                user: isRequester ? conn.recipient : conn.requester
            }
        })

    } catch (err) {
        connectionLogger.error(err.message, { function: "getConnections" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getConnectionStatus = async (viewerId, profileUserId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(profileUserId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const connection = await Connection.findOne({
            $or: [
                { requester: viewerId, recipient: profileUserId },
                { requester: profileUserId, recipient: viewerId }
            ]
        })

        if (!connection) {
            return { status: "none", connectionId: null, isRequester: false }
        }

        return {
            status: connection.status,
            connectionId: connection._id,
            isRequester: connection.requester.toString() === viewerId.toString()
        }

    } catch (err) {
        connectionLogger.error(err.message, { function: "getConnectionStatus" })
        throw new AppError(err.message, err.statusCode)
    }
}


module.exports = { sendRequest, acceptRequest, removeConnection, getConnections, getConnectionStatus }
