import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import * as userRepo from '../repositories/user.repository.js';
import * as productRepo from '../repositories/product.repository.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/users', async (req, res, next) => {
    try {
        const users = await userRepo.findAll();
        return res.json({
            success: true,
            code: 200,
            status: 'User fetched successfully',
            message: 'All user fetched successfully.',
            data: users,
            options: {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                total: users.length
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get('/users/:id', async (req, res, next) => {
    try {
        const user = await userRepo.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Error Id',
                message: 'User had been deleted or error occured'
            });
        }
        return res.json({
            success: true,
            code: 200,
            status: 'User fetched successfully',
            message: 'User details has been fetched successfully',
            data: user
        });
    } catch (err) {
        next(err);
    }
});

router.put('/users/:id', async (req, res, next) => {
    try {
        const updated = await userRepo.update(req.params.id, {
            isBan: req.body.isBan
        });
        return res.json({
            success: true,
            code: 200,
            status: 'User updated successfully',
            message: 'User details has been updated successfully',
            data: updated
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/users/:id', async (req, res, next) => {
    try {
        const user = await userRepo.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Error Id',
                message: 'User not found'
            });
        }
        await userRepo.remove(req.params.id);
        return res.json({
            success: true,
            code: 200,
            status: 'User deleted successfully',
            message: 'User has been deleted successfully',
            data: user
        });
    } catch (err) {
        next(err);
    }
});

router.get('/products', async (req, res, next) => {
    try {
        const { title, seller, category, minPrice, maxPrice, minRating, maxRating, limit = 10, page = 1 } = req.query;
        let products = await productRepo.findAll(10000, 0);
        
        if (title) {
            products = products.filter(p => p.name.toLowerCase().includes(String(title).toLowerCase()));
        }
        if (seller) {
            products = products.filter(p => p.seller_id == seller);
        }
        if (category) {
            products = products.filter(p => p.category_id == category);
        }
        if (minPrice && maxPrice) {
            const min = Number(minPrice);
            const max = Number(maxPrice);
            products = products.filter(p => p.price >= min && p.price <= max);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const paginated = products.slice(offset, offset + parseInt(limit));

        return res.json({
            success: true,
            message: 'Product fetched Successfully',
            data: paginated,
            options: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: products.length
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
