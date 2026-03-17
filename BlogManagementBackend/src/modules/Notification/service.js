const { Notification } = require("../../model/Notification");
const AppError = require("../../utils/AppError");

const getNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "fullName userName avatar")
            .sort({ createdAt: -1 })
            .limit(50); // limit to recent 50 for performance

        return notifications;
    } catch (err) {
        throw new AppError(err.message, 500);
    }
};

const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) throw new AppError("Notification not found", 404);
        return notification;
    } catch (err) {
        throw new AppError(err.message, err.statusCode || 500);
    }
};

const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        return { success: true };
    } catch (err) {
        throw new AppError(err.message, 500);
    }
};

// Utility function to be used by other services (like Connection/Post services)
const createNotification = async (data) => {
    try {
        const { recipient, sender, type, relatedId, message } = data;

        // Don't send notification to self
        if (recipient.toString() === sender.toString()) return null;

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            relatedId,
            message
        });

        return notification;
    } catch (err) {
        console.error("Failed to create notification:", err);
        // We generally don't want notification failure to break the main transaction (like accepting a connection)
        // so we just log it and return null
        return null;
    }
};

const deleteNotification = async (data) => {
    try {
        await Notification.deleteMany(data);
    } catch (err) {
        console.error("Failed to delete notification:", err);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification
};
