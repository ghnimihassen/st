import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, OrderController.getAll);
router.get('/stats', authMiddleware, adminMiddleware, OrderController.getStats);
router.get('/:id', authMiddleware, OrderController.getById);
router.post('/', authMiddleware, OrderController.create);
router.patch('/:id/status', authMiddleware, OrderController.updateStatus);

export default router;