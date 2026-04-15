import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, ReferralController.getAll);
router.get('/pending', authMiddleware, adminMiddleware, ReferralController.getPending);
router.get('/referrer/:referrerId', authMiddleware, ReferralController.getByReferrer);
router.post('/', authMiddleware, adminMiddleware, ReferralController.create);
router.post('/complete', authMiddleware, ReferralController.complete);
router.post('/:id/validate', authMiddleware, adminMiddleware, ReferralController.validate);

export default router;