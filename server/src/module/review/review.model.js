const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    body: { type: String, default: " " },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("Review", ReviewSchema);

module.exports = ReviewModel;
