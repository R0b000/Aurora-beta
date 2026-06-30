import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import * as productRepo from '../repositories/product.repository.js';

const router = Router();

router.use(authenticate, requireRole('seller'));

router.post('/products', uploadSingle('image'), async (req, res, next) => {
    try {
        const slug = req.body.title.toLowerCase().replace(/\s+/g, '-');
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const product = await productRepo.create({
            seller_id: req.user.id,
            category_id: req.body.category ? req.body.category[0] || req.body.category : null,
            name: req.body.title,
            slug: slug,
            price: req.body.price,
            stock: req.body.stock,
            description: req.body.description || null,
            image_url: image_url
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (err) {
        next(err);
    }
});

router.get('/products', async (req, res, next) => {
    try {
        const sellerId = req.query.seller || req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        let products;
        if (sellerId) {
            products = await productRepo.findBySeller(sellerId, limit, offset);
        } else {
            const all = await productRepo.findAll(1000, 0);
            products = all.slice(offset, offset + limit);
        }

        let total = products.length;
        if (sellerId) {
            const allSeller = await productRepo.findBySeller(sellerId, 10000, 0);
            total = allSeller.length;
        }

        return res.json({
            success: true,
            message: 'Product list fetched successfully',
            data: products,
            options: { page, limit, total }
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
            message: 'Product fetched successfully',
            data: product
        });
    } catch (err) {
        next(err);
    }
});

router.put('/products/:id', uploadSingle('image'), async (req, res, next) => {
    try {
        const existing = await productRepo.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await productRepo.update(req.params.id, req.user.id, {
            name: req.body.title || existing.name,
            slug: req.body.title ? req.body.title.toLowerCase().replace(/\s+/g, '-') : existing.slug,
            price: req.body.price || existing.price,
            stock: req.body.stock || existing.stock,
            description: req.body.description || existing.description,
            is_active: req.body.isPublished !== undefined ? (req.body.isPublished ? 1 : 0) : existing.is_active
        });

        const updated = await productRepo.findById(req.params.id);
        return res.json({
            success: true,
            message: 'Product updated successfully',
            data: updated
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/products/:id', async (req, res, next) => {
    try {
        const existing = await productRepo.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        await productRepo.remove(req.params.id);
        return res.json({
            success: true,
            message: 'Product deleted successfully',
            data: existing
        });
    } catch (err) {
        next(err);
    }
});

export default router;
