const { message } = require("../banner/banner.validation");
const productSvc = require("../product/product.service");
const reviewSvc = require("./review.service");

class ReviewController {
  createReview = async (req, res, next) => {
    try {
      const { id } = req.params;
      let body = req.body;

      body.product = id;

      if (req.loggedInUser.isBan === true) {
        throw {
          code: 402,
          status: "you are banned",
          message: "contact to admin",
        };
      }
      if (req.loggedInUser.isVerified === false) {
        throw {
          code: 402,
          status: "Verify you account first",
          message:
            "Since your account is not verified, you cannot create the review",
        };
      }

      body.user = req.loggedInUser._id;

      const createReviews = await reviewSvc.createReview(body);

      let reviewProduct = await productSvc.getSingleProductById({
        _id: createReviews.product
      })

      reviewProduct.totalReviews += 1
      reviewProduct.save();

      res.json({
        data: createReviews,
        code: 200,
        status: "review has been created",
        message: "your review is added",
      });
    } catch (error) {
      throw error;
    }
  };

  listSingleReview = async (req, res, next) => {
    try {
      const { id } = req.params;

      const reviews = await reviewSvc.getSingleReview({ _id: id });
      //need to check for id
      if (!reviews) {
        throw {
          code: 422,
          status: "your review is not found",
          message: "no review is found",
        };
      }
      res.json({
        data: reviews,
        code: 200,
        status: "review has been created",
        message: "your review is added",
      });
    } catch (error) {
      throw error;
    }
  };

  listReview = async (req, res) => {
    try {
      const productId = req.params.id;

      const reviews = await reviewSvc.getReviewsByProductId(productId);

      res.status(200).json({
        success: true,
        reviews,
        total: reviews.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
        error: error.message,
      });
    }
  };

  updateReview = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateDetails = await reviewSvc.updateReview(
        { _id: id },
        { $set: req.body }
      );

      if (!updateDetails) {
        throw {
          code: 422,
          status: "you have incorrect updateID",
          message: "Review is not found",
        };
      }

      res.json({
        data: updateDetails,
        code: 200,
        status: "Review updated sucessfully",
        message: "Revies has been updated",
      });
    } catch (error) {
      throw error;
    }
  };

  deletedReview = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteReviews = await reviewSvc.deleteReview({ _id: id });

      res.json({
        data: deleteReviews,
        code: 200,
        status: "review has been deleted",
        message: "Review has been deleted sucessfully",
      });
    } catch (error) {
      throw error;
    }
  };
}

const reviewCtrl = new ReviewController();

module.exports = reviewCtrl;
