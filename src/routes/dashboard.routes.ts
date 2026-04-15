import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', authMiddleware, adminMiddleware, DashboardController.getOverview);
router.get('/sales', authMiddleware, adminMiddleware, DashboardController.getSalesByDay);
router.get('/top-items', authMiddleware, adminMiddleware, DashboardController.getTopItems);
router.get('/tier-distribution', authMiddleware, adminMiddleware, DashboardController.getTierDistribution);
router.get('/loyalty-activity', authMiddleware, adminMiddleware, DashboardController.getLoyaltyActivity);

export default router;