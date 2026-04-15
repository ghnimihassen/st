import { Router } from 'express';
import { ShareController } from '../controllers/share.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, ShareController.getAll);
router.get('/my', authMiddleware, ShareController.getMyLinks);
router.get('/admin/stats', authMiddleware, adminMiddleware, ShareController.getStats);
router.get('/validate/:code', ShareController.validate);
router.get('/info/:code', ShareController.getInfo);
router.post('/', authMiddleware, ShareController.create);

export default router;