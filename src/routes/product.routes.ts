import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, ProductController.getAll);
router.get('/low-stock', authMiddleware, ProductController.getLowStock);
router.get('/:id', authMiddleware, ProductController.getById);
router.get('/:id/stock', authMiddleware, ProductController.getStock);
router.post('/', authMiddleware, adminMiddleware, ProductController.create);
router.put('/:id', authMiddleware, adminMiddleware, ProductController.update);
router.delete('/:id', authMiddleware, adminMiddleware, ProductController.delete);

export default router;