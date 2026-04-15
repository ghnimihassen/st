import { Router } from 'express';
import { BatchController } from '../controllers/batch.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ✅ Route pour récupérer tous les lots (avec filtres)
router.get('/', authMiddleware, BatchController.getAll);

router.get('/expiring', authMiddleware, BatchController.getExpiring);
router.get('/low-stock', authMiddleware, BatchController.getLowStockBatches);
router.get('/product/:productId', authMiddleware, BatchController.getByProduct);
router.get('/batch-number/:batchNumber', authMiddleware, BatchController.getByBatchNumber);
router.get('/stats', authMiddleware, adminMiddleware, BatchController.getStats);
router.get('/expired', authMiddleware, BatchController.getExpired);
router.post('/', authMiddleware, adminMiddleware, BatchController.create);
router.put('/:id', authMiddleware, adminMiddleware, BatchController.update);
router.delete('/:id', authMiddleware, adminMiddleware, BatchController.delete);
router.patch('/:id/open', authMiddleware, adminMiddleware, BatchController.open);
router.patch('/:id/consume', authMiddleware, adminMiddleware, BatchController.consume);
router.patch('/:id/transfer', authMiddleware, adminMiddleware, BatchController.transfer);
router.post('/:id/split', authMiddleware, adminMiddleware, BatchController.split);

export default router;