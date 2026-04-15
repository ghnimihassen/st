import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, ClientController.getAll);
router.get('/stats', authMiddleware, adminMiddleware, ClientController.getGlobalStats);
router.get('/:id', authMiddleware, ClientController.getById);
router.get('/:id/stats', authMiddleware, ClientController.getStats);
router.post('/', authMiddleware, adminMiddleware, ClientController.create);
router.put('/:id', authMiddleware, ClientController.update);
router.delete('/:id', authMiddleware, adminMiddleware, ClientController.delete);
router.post('/:id/points', authMiddleware, ClientController.addPoints);
router.post('/:id/redeem', authMiddleware, ClientController.addPoints);
router.post('/:id/redeem-reward', authMiddleware, ClientController.redeemReward);

export default router;