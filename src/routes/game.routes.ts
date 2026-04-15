import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, GameController.getAll);
router.get('/history/me', authMiddleware, GameController.getHistory);
router.get('/:gameType/can-play', authMiddleware, GameController.canPlay);
router.post('/:gameType/play', authMiddleware, GameController.play);

// CRUD par ObjectId (ancien)
router.post('/', authMiddleware, adminMiddleware, GameController.create);
router.put('/:id', authMiddleware, adminMiddleware, GameController.update);
router.delete('/:id', authMiddleware, adminMiddleware, GameController.delete);

// ✅ Nouvelles routes pour mise à jour par type (utilisées par le frontend)
router.put('/type/:type', authMiddleware, adminMiddleware, GameController.updateByType);
router.delete('/type/:type', authMiddleware, adminMiddleware, GameController.deleteByType);

export default router;