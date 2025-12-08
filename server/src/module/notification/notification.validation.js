// src/notification/notification.validation.js
const Joi = require("joi");

const createNotificationSchema = Joi.object({
  // This is for INTERNAL use (sendNotification helper), not from user input
  // So we allow both string and ObjectId (Mongoose will handle conversion)
  user: Joi.any().required().label("User ID").messages({
    "any.required": "User ID is required",
  }),

  type: Joi.string()
    .valid("ORDER", "PAYMENT", "SYSTEM") // ← Must match your model exactly!
    .default("SYSTEM"),

  title: Joi.string().min(3).max(100).trim().required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 100 characters",
  }),

  body: Joi.string().min(5).max(500).trim().required().messages({
    "string.empty": "Message body is required",
    "string.min": "Message must be at least 5 characters",
  }),

  isRead: Joi.boolean().default(false),

  relatedResource: Joi.object({
    id: Joi.string().hex().length(24).optional(), // ObjectId format
    model: Joi.string().valid("Transaction", "Order", "Product").optional(),
  })
    .optional()
    .custom((value, helpers) => {
      // If relatedResource exists, at least one of id or model should be present
      if (!value.id && !value.model) {
        return helpers.message(
          "relatedResource must contain at least 'id' or 'model'"
        );
      }
      return value;
    }),
}).unknown(false); // Reject unknown fields

// For marking a notification as read
const markAsReadSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.empty": "Notification ID is required",
    "string.hex": "Invalid notification ID format",
    "string.length": "Notification ID must be a valid 24-character hex string",
  }),
});

// Optional: for pagination
const listNotificationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createNotificationSchema,
  markAsReadSchema,
  listNotificationSchema,
};
