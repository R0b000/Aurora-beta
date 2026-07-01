import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import * as uploadCtrl from '../controllers/upload.controller.js';

const router = Router();

router.post('/', authenticate, requireRole('admin'), uploadSingle('file'), uploadCtrl.uploadFile);

export default router;
