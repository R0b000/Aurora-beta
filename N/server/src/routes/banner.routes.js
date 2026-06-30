import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import * as bannerCtrl from '../controllers/banner.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.post('/', uploadSingle('image'), bannerCtrl.createBanner);
router.get('/list', bannerCtrl.listAllBanners);
router.get('/:id', bannerCtrl.getBannerById);
router.route('/:id')
    .put(uploadSingle('image'), bannerCtrl.updateBanner)
    .delete(bannerCtrl.deleteBanner);

export default router;
