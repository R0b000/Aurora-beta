import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import * as categoryCtrl from '../controllers/category.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.route('/')
    .post(categoryCtrl.createCategory)
    .get(categoryCtrl.listCategory);

router.route('/:id')
    .get(categoryCtrl.getCategoryById)
    .put(categoryCtrl.updateCategory)
    .delete(categoryCtrl.deleteCategory);

export default router;
