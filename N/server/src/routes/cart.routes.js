import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import * as cartRepo from '../repositories/cart.repository.js';
import * as orderRepo from '../repositories/order.repository.js';

const router = Router();
const cartRouter = Router();
const orderRouter = Router();

// Cart routes
cartRouter.use(authenticate, requireRole('customer'));

cartRouter.get('/list', async (req, res, next) => {
    try {
        let cart = await cartRepo.findActiveByUserId(req.user.id);
        if (!cart) {
            cart = await cartRepo.create(req.user.id);
        }
        return res.json({
            success: true,
            message: 'Cart fetched successfully',
            data: cart
        });
    } catch (err) {
        next(err);
    }
});

cartRouter.get('/items/:id', async (req, res, next) => {
    try {
        const items = await cartRepo.findByCart(req.params.id);
        return res.json({
            success: true,
            message: 'Cart items fetched successfully',
            data: items
        });
    } catch (err) {
        next(err);
    }
});

cartRouter.post('/items', async (req, res, next) => {
    try {
        let cart = await cartRepo.findActiveByUserId(req.user.id);
        if (!cart) {
            cart = await cartRepo.create(req.user.id);
        }

        const productId = req.query.id;
        await cartRepo.upsert({
            cartId: cart.id,
            productId: productId,
            quantity: req.body.quantity || 1,
            unitPrice: req.body.unitPrice || 0
        });

        return res.json({
            success: true,
            message: 'Added to cart successfully',
            data: cart
        });
    } catch (err) {
        next(err);
    }
});

cartRouter.put('/items/:id', async (req, res, next) => {
    try {
        await cartRepo.updateQuantity(req.params.id, req.body.quantity);
        return res.json({
            success: true,
            message: 'Cart updated successfully'
        });
    } catch (err) {
        next(err);
    }
});

cartRouter.delete('/items/:id', async (req, res, next) => {
    try {
        await cartRepo.removeItem(req.params.id);
        return res.json({
            success: true,
            message: 'Cart item removed successfully'
        });
    } catch (err) {
        next(err);
    }
});

// Checkout/Order routes
orderRouter.use(authenticate, requireRole('customer'));

orderRouter.post('/:id', async (req, res, next) => {
    try {
        const cart = await cartRepo.findActiveByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const order = await orderRepo.create({
            orderNumber: null,
            userId: req.user.id,
            cartId: cart.id,
            subtotal: req.body.subtotal || 0,
            discount: req.body.discount || 0,
            shipping: req.body.shipping || 0,
            total: req.body.total || 0
        });

        const items = await cartRepo.findByCart(cart.id);
        await orderRepo.createItems(items.map(item => ({
            orderId: order.id,
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: item.unit_price
        })));

        return res.json({
            success: true,
            message: 'Checkout successful',
            data: order
        });
    } catch (err) {
        next(err);
    }
});

orderRouter.get('/list', async (req, res, next) => {
    try {
        const orders = await orderRepo.findByUser(req.user.id);
        return res.json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (err) {
        next(err);
    }
});

orderRouter.post('/payment/:id', (req, res) => {
    return res.json({
        success: true,
        message: 'Payment initiated',
        data: { orderId: req.params.id }
    });
});

router.use('/cart', cartRouter);
router.use('/checkout', orderRouter);

export default router;
