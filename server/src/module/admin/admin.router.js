const uploader = require('../../middleware/uploader.middleware');
const authValidator = require('../../middleware/validation.middleware');
const bannerCtrl = require('../banner/banner.controller');
const BannerValidationDTO = require('../banner/banner.validation');
const categoryCtrl = require('../category/category.controller');
const CategoryValidationDTO = require('../category/category.validation');
const couponRouter = require('../coupon/coupon.router');
const productCtrl = require('../product/product.controller');
const adminCtrl = require('./admin.controller');

const adminRouter = require('express').Router();

adminRouter.get('/users/', adminCtrl.listUsers)
adminRouter.route('/users/:id')
    .get(adminCtrl.getUserById)
    .put(adminCtrl.updateUserById)
    .delete(adminCtrl.deleteUserById)

adminRouter.route('/category')
    .post(uploader().single('image'), authValidator(CategoryValidationDTO), categoryCtrl.createCategory)
    .get(categoryCtrl.listCategory)
    
adminRouter.route('/category/:id')
    .get(categoryCtrl.getCategoryById)
    .delete(categoryCtrl.deleteCategory)
    .put(uploader().single('image'), categoryCtrl.updateCategoryById)

adminRouter.post("/banners", uploader().single('image'), authValidator(BannerValidationDTO), bannerCtrl.createBanner);
adminRouter.get("/banners/list", bannerCtrl.listAllBanners);
adminRouter.get("/banners/:id", bannerCtrl.bannerDetailsById);

adminRouter.route('/banners/:id')
    .put(uploader().single('image'), bannerCtrl.editBanner)
    .delete(bannerCtrl.deleteBanner),

adminRouter.get('/products', productCtrl.listProduct)

adminRouter.use('/coupon', couponRouter)

module.exports = adminRouter;