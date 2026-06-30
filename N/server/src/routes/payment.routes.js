import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRole('customer'));

router.post('/payment-success', (req, res) => {
    return res.json({
        success: true,
        message: 'Payment recorded successfully',
        data: req.body
    });
});

export default router;
