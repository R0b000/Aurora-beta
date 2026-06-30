import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import * as categoryCtrl from '../controllers/category.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.route('/')
    .post(uploadSingle('image'), categoryCtrl.createCategory)
    .get(categoryCtrl.listCategory);

router.route('/:id')
    .get(categoryCtrl.getCategoryById)
    .put(uploadSingle('image'), categoryCtrl.updateCategory)
    .delete(categoryCtrl.deleteCategory);

export default router;
