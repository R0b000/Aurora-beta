const route = require("express").Router();
const auth = require("../middleware/auth.middleware");
const adminRouter = require("../module/admin/admin.router");
const authRouter = require("../module/auth/auth.router");
const cartRouter = require("../module/cart/cart.router");
const paymentRoute = require("../module/payment/payment.route");
const sellerRouter = require("../module/seller/seller.router");
const userPublicRouter = require("../module/user/user.route");
const { userRoles } = require("./const.config");

route.use("/auth/", authRouter);
route.use("/admin/", auth([userRoles.ADMIN]), adminRouter);
route.use("/seller/", auth([userRoles.SELLER]), sellerRouter);
route.use("/cart", auth([userRoles.CUSTOMER]), cartRouter);
// route.use("/review", auth([userRoles.CUSTOMER]), reviewRouter);

//public routes
route.use("/", userPublicRouter);

//payment
route.use("/payment", auth(userRoles.CUSTOMER), paymentRoute);

module.exports = route;
