import { Router } from 'express';
import { SpecialDayController } from '../controllers/specialDay.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, SpecialDayController.getAll);
router.get('/today-multiplier', authMiddleware, SpecialDayController.getTodayMultiplier);
router.post('/', authMiddleware, adminMiddleware, SpecialDayController.create);
router.put('/:id', authMiddleware, adminMiddleware, SpecialDayController.update);
router.delete('/:id', authMiddleware, adminMiddleware, SpecialDayController.delete);

export default router;