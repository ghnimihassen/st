import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, RewardController.getAll);
router.get('/:id', authMiddleware, RewardController.getById);
router.post('/', authMiddleware, adminMiddleware, RewardController.create);
router.put('/:id', authMiddleware, adminMiddleware, RewardController.update);
router.delete('/:id', authMiddleware, adminMiddleware, RewardController.delete);

export default router;