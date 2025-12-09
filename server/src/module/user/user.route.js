const userPublicRouter = require('express').Router();
const { userRoles } = require('../../config/const.config');
const auth = require('../../middleware/auth.middleware');
const authValidator = require('../../middleware/validation.middleware');
const categoryCtrl = require('../category/category.controller');
const orderItemsCtrl = require('../orderItems/orderItems.controller');
const productCtrl = require('../product/product.controller');
const reviewCtrl = require('../review/review.controller');
const reviewValidation = require('../review/review.validation');

//public Rotue
userPublicRouter.get("/products", productCtrl.listProduct);
userPublicRouter.get("/products/:id", productCtrl.getSingleProductById);
userPublicRouter.get("/categories", categoryCtrl.listCategory);

//Integrating Trending
//For this I want to use the datas from the order section and then I want to add those products that are highly purchased
// userPublicRouter.get('/trending', productCtrl.getTrendingProducts)

userPublicRouter.get(
  "/categories/:id/products",
  categoryCtrl.listProductByCateogoryId
);
userPublicRouter.get("/search", productCtrl.listProduct);

userPublicRouter.post(
  "/checkout/:id",
  auth(userRoles.CUSTOMER),
  orderItemsCtrl.checkout
);
userPublicRouter.delete(
  "/checkout/remove/:id",
  auth(userRoles.CUSTOMER),
  orderItemsCtrl.cancelCheckout
);
userPublicRouter.get(
  "/checkout/list",
  auth(userRoles.CUSTOMER),
  orderItemsCtrl.checkoutList
);
userPublicRouter.post(
  "/checkout/payment/:id",
  auth(userRoles.CUSTOMER),
  orderItemsCtrl.khaltPaymentCheckout
);

//Review system
userPublicRouter.post(
    "/products/:id/review",
    auth(userRoles.CUSTOMER),
    authValidator(reviewValidation),
    reviewCtrl.createReview
);
userPublicRouter.get(
    "/review/:id",
    authValidator(reviewValidation),
    reviewCtrl.listSingleReview
);
userPublicRouter.get(
    "/review",
    auth(userRoles.ADMIN),
    authValidator(reviewValidation),
    reviewCtrl.listReview
);

userPublicRouter.get(
    "/products/:id/review",
    authValidator(reviewValidation),
    reviewCtrl.listReview
);
userPublicRouter.put(
    "/products/:id/review/:id",
    auth(userRoles.CUSTOMER),
    authValidator(reviewValidation),
    reviewCtrl.updateReview
);
userPublicRouter.delete(
    "/products/:id/review/:id",
    auth(userRoles.CUSTOMER),
    authValidator(reviewValidation),
    reviewCtrl.deletedReview
);

module.exports = userPublicRouter
