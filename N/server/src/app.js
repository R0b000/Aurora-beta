import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/category.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import userRoutes from './routes/user.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:5000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Category routes (admin)
app.use('/api/admin/category', categoryRoutes);

// Banner routes (admin)
app.use('/api/admin/banners', bannerRoutes);

// Cart and checkout routes
app.use('/api', cartRoutes);

// Payment routes
app.use('/api/payment', paymentRoutes);

// Seller routes
app.use('/api/seller', sellerRoutes);

// Public user routes
app.use('/api', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;