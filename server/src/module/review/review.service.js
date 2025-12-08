const ReviewModel = require("./review.model");

class ReviewService {
  createReview = async (data) => {
    try {
      const review = new ReviewModel(data);
      return await review.save();
    } catch (error) {
      console.log("error on adding the review", error);
      throw error;
    }
  };

  getSingleReview = async (id) => {
    try {
      const singleReview = await ReviewModel.findById(id)
        .populate("product")
        .populate("user", "name email");

      return singleReview;
    } catch (error) {
      console.log("error on getting  your review", error);
      throw error;
    }
  };

  getReviewsByProductId = async (productId) => {
    try {
      const reviews = await ReviewModel.find({ product: productId })
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 });

      return reviews;
    } catch (error) {
      console.log("Error fetching reviews for product:", error);
      throw error;
    }
  };
  updateReview = async (id, data) => {
    try {
      const updated = await ReviewModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      return updated;
    } catch (error) {
      console.log("error on updating data");
      throw error;
    }
  };

  deleteReview = async (id) => {
    try {
      const deleted = await ReviewModel.findByIdAndDelete(id);
      return deleted;
    } catch (error) {
      console.log("error on deleting review", error);
      throw error;
    }
  };
}

const reviewSvc = new ReviewService();
module.exports = reviewSvc;
