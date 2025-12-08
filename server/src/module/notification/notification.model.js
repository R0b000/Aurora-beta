const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["ORDER", "PAYMENT", "SYSTEM"] },
    title: String,
    body: String,
    isRead: { type: Boolean, default: false },
    relatedResource: {
      id: { type: mongoose.Schema.Types.ObjectId },
      model: { type: String, enum: ["Transaction", "Order", "Product"] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
