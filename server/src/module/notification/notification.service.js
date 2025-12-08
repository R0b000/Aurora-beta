// src/notification/notification.service.js
const { Notification } = require("./notification.model");

class NotificationService {
  createNotificationservice = async (data) => {
    const notification = new Notification(data);
    return await notification.save();
  };

  getUserNotification = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ user: userId });

    return {
      notifications,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: +page < Math.ceil(total / limit),
      },
    };
  };

  markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new Error("Notification not found or access denied");
    }
    return notification;
  };

  deleteNotificaition = async (notificationId, userId) => {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new Error("Notification not found or access denied");
    }
    return { message: "Notification deleted successfully" };
  };

  // Bonus: Mark all as read
  markAllAsRead = async (userId) => {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    return { message: "All notifications marked as read" };
  };
}

const NotificationSvc = new NotificationService();
module.exports = NotificationSvc;
