import { Router } from 'express';
import * as productRepo from '../repositories/product.repository.js';
import * as categoryRepo from '../repositories/category.repository.js';

const router = Router();

router.get('/products', async (req, res, next) => {
    try {
        const { title, category, minPrice, maxPrice, minRating, maxRating, limit = 10, page = 1 } = req.query;
        let products = await productRepo.findAll(10000, 0);
        
        if (title) {
            products = products.filter(p => p.name.toLowerCase().includes(String(title).toLowerCase()));
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

router.get('/products/:id', async (req, res, next) => {
    try {
        const product = await productRepo.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        return res.json({
            success: true,
            message: 'Product fetched Successfully',
            data: product
        });
    } catch (err) {
        next(err);
    }
});

router.get('/categories', async (req, res, next) => {
    try {
        const categories = await categoryRepo.findAll();
        return res.json({
            success: true,
            message: 'Category fetched successfully',
            data: categories
        });
    } catch (err) {
        next(err);
    }
});

router.get('/categories/:id/products', async (req, res, next) => {
    try {
        const products = await productRepo.findAll(10000, 0);
        const filtered = products.filter(p => p.category_id == req.params.id);
        return res.json({
            success: true,
            message: 'Product details fetched successfully',
            data: filtered
        });
    } catch (err) {
        next(err);
    }
});

export default router;
