// backend/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database';  // ← src/

// Import Routes (maintenant avec ./src/routes/)
import authRoutes from './src/routes/auth.routes';
import clientRoutes from './src/routes/client.routes';
import productRoutes from './src/routes/product.routes';
import batchRoutes from './src/routes/batch.routes';
import menuRoutes from './src/routes/menu.routes';
import orderRoutes from './src/routes/order.routes';
import rewardRoutes from './src/routes/reward.routes';
import missionRoutes from './src/routes/mission.routes';
import gameRoutes from './src/routes/game.routes';
import referralRoutes from './src/routes/referral.routes';
import specialDayRoutes from './src/routes/specialDay.routes';
import shareRoutes from './src/routes/share.routes';
import employeeRoutes from './src/routes/employee.routes';
import posRoutes from './src/routes/pos.routes';
import productionRoutes from './src/routes/production.routes';
import dashboardRoutes from './src/routes/dashboard.routes';
import stockRoutes from './src/routes/stock.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// Database
connectDB();

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/special-days', specialDayRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', stockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});