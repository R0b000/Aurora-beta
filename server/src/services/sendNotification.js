// src/utils/sendNotification.js
const NotificationSvc = require("../module/notification/notification.service");

/**
 * Send notification to a user (used across the app)
 * @param {String|ObjectId} userId 
 * @param {String} type - "ORDER" | "PAYMENT" | "SYSTEM"
 * @param {String} title 
 * @param {String} body 
 * @param {Object} relatedResource - optional: { _id, model: "Order" | "Transaction" | ... }
 */
const sendNotification = async (userId, type, title, body, relatedResource = null) => {
  try {
    const notificationData = {
      user: userId,
      type,
      title,
      body,
      isRead: false,
    };

    if (relatedResource) {
      notificationData.relatedResource = {
        id: relatedResource._id || relatedResource.id,
        model: relatedResource.constructor?.modelName || relatedResource.model || "Order",
      };
    }

    await NotificationSvc.createNotificationservice(notificationData);
    console.log(`Notification sent to user ${userId}: ${title}`);
  } catch (error) {
    // Never break the main flow (payment/order) because of notification failure
    console.error("Failed to send notification:", error.message);
  }
};

module.exports = sendNotification;