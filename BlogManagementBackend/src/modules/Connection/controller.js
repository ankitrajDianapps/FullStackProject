const connectionService = require("./service.js")
const { apiResponse } = require("../../config/responseHandler.js")


module.exports.sendRequest = async (req, res) => {
    try {
        const connection = await connectionService.sendRequest(req.user._id, req.params.recipientId)

        return apiResponse({
            res,
            code: 201,
            message: "Connection request sent",
            status: true,
            data: connection
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


module.exports.acceptRequest = async (req, res) => {
    try {
        const connection = await connectionService.acceptRequest(req.params.connectionId, req.user._id)

        return apiResponse({
            res,
            code: 200,
            message: "Connection accepted",
            status: true,
            data: connection
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


module.exports.removeConnection = async (req, res) => {
    try {
        await connectionService.removeConnection(req.user._id, req.params.recipientId)

        return apiResponse({
            res,
            code: 200,
            message: "Connection removed",
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


module.exports.getConnections = async (req, res) => {
    try {
        // Allow fetching another user's connections via ?userId=xxx, else own
        const targetUserId = req.query.userId || req.user._id
        const connections = await connectionService.getConnections(targetUserId)

        return apiResponse({
            res,
            code: 200,
            message: "Connections fetched successfully",
            status: true,
            data: connections
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


module.exports.getConnectionStatus = async (req, res) => {
    try {
        const statusData = await connectionService.getConnectionStatus(req.user._id, req.params.profileUserId)

        return apiResponse({
            res,
            code: 200,
            message: "Connection status fetched",
            status: true,
            data: statusData
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
