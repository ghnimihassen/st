import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Import Routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import productRoutes from './routes/product.routes';
import batchRoutes from './routes/batch.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import rewardRoutes from './routes/reward.routes';
import missionRoutes from './routes/mission.routes';
import gameRoutes from './routes/game.routes';
import referralRoutes from './routes/referral.routes';
import specialDayRoutes from './routes/specialDay.routes';
import shareRoutes from './routes/share.routes';
import employeeRoutes from './routes/employee.routes';
import posRoutes from './routes/pos.routes';
import productionRoutes from './routes/production.routes';
import dashboardRoutes from './routes/dashboard.routes';
import stockRoutes from './routes/stock.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - Important pour la connexion frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware (optionnel)
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// ==================== ROUTES ====================

// Auth routes
app.use('/api/auth', authRoutes);

// Client routes
app.use('/api/clients', clientRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Batch routes
app.use('/api/batches', batchRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Loyalty routes
app.use('/api/loyalty', loyaltyRoutes);

// Reward routes
app.use('/api/rewards', rewardRoutes);

// Mission routes
app.use('/api/missions', missionRoutes);

// Game routes
app.use('/api/games', gameRoutes);

// Referral routes
app.use('/api/referrals', referralRoutes);

// Special Day routes
app.use('/api/special-days', specialDayRoutes);

// Share routes
app.use('/api/share', shareRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// POS routes
app.use('/api/pos', posRoutes);

// Production routes
app.use('/api/production', productionRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Stock routes (categories, sub-categories, storage-locations, suppliers)
app.use('/api', stockRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.method} ${req.path} not found` 
  });
});

// ==================== ERROR HANDLER ====================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Le Pavé d'Art - Backend                         ║
║                                                      ║
║   📡 Server: http://localhost:${PORT}                  ║
║   ✅ MongoDB: Connected                              ║
║   📝 API Ready                                       ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║   📚 Available Routes:                               ║
║   • POST   /api/auth/login                           ║
║   • POST   /api/auth/register                        ║
║   • GET    /api/auth/me                              ║
║   • GET    /api/clients                              ║
║   • GET    /api/products                             ║
║   • GET    /api/menu                                 ║
║   • POST   /api/orders                               ║
║   • GET    /api/rewards                              ║
║   • GET    /api/games                                ║
║   • GET    /api/health                               ║
╚══════════════════════════════════════════════════════╝
  `);
});