import { Router } from 'express';
import { POSController } from '../controllers/pos.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/find-client', authMiddleware, POSController.findClient);
router.post('/calculate-points', authMiddleware, POSController.calculatePoints);
router.post('/purchase', authMiddleware, POSController.purchase);
router.post('/manual-points', authMiddleware, POSController.addManualPoints);
router.get('/transactions/:clientId', authMiddleware, POSController.getTransactions);

export default router;