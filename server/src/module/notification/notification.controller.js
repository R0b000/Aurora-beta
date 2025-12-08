// src/notification/notification.controller.js
const NotificationSvc = require("./notification.service");

class NotificationController {
  // Get logged-in user's notifications
  getUserNotificaiton = async (req, res) => {
    try {
      const userId = req.loggedInUser._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await NotificationSvc.getUserNotification(
        userId,
        page,
        limit
      );

      res.json({
        result: result.notifications,
        pagination: result.pagination,
        code: 200,
        status: "success",
        message: "Notifications fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Mark one as read
  markAsRead = async (req, res) => {
    try {
      const { id } = req.params; // notification ID
      const userId = req.loggedInUser._id;

      const notification = await NotificationSvc.markAsRead(id, userId);

      res.json({
        result: notification,
        code: 200,
        status: "success",
        message: "Notification marked as read",
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  // Mark all as read
  markAllAsRead = async (req, res) => {
    try {
      const userId = req.loggedInUser._id;
      await NotificationSvc.markAllAsRead(userId);

      res.json({
        code: 200,
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Delete notification
  deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.loggedInUser._id;

      await NotificationSvc.deleteNotificaition(id, userId);

      res.json({
        code: 200,
        status: "success",
        message: "Notification deleted",
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  };
}

const notificationCtrl = new NotificationController();
module.exports = notificationCtrl;