import { Router } from 'express';
import { MissionController } from '../controllers/mission.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, MissionController.getAll);
router.get('/my-progress', authMiddleware, MissionController.getMyProgress);
router.post('/', authMiddleware, adminMiddleware, MissionController.create);
router.put('/:id', authMiddleware, adminMiddleware, MissionController.update);
router.delete('/:id', authMiddleware, adminMiddleware, MissionController.delete);
router.patch('/progress', authMiddleware, MissionController.updateProgress);

export default router;