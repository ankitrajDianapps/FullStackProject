const notificationService = require("./service");
const { apiResponse } = require("../../config/responseHandler");

module.exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getNotifications(req.user._id);
        return apiResponse({
            res,
            code: 200,
            message: "Notifications fetched successfully",
            status: true,
            data: notifications
        });
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user._id);
        return apiResponse({
            res,
            code: 200,
            message: "Notification marked as read",
            status: true,
            data: notification
        });
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        });
    }
};

module.exports.markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        return apiResponse({
            res,
            code: 200,
            message: "All notifications marked as read",
            status: true
        });
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        });
    }
};

module.exports.deleteById = async (req, res) => {
    try {
        await notificationService.deleteNotification({ _id: req.params.id, recipient: req.user._id });
        return apiResponse({
            res,
            code: 200,
            message: "Notification deleted successfully",
            status: true
        });
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        });
    }
};
