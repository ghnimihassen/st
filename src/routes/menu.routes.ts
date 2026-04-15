import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ==================== ROUTES PUBLIQUES (pas d'auth) ====================
router.get('/categories', MenuController.getAllCategories);   // ← sans auth
router.get('/', MenuController.getAllItems);                  // ← sans auth
router.get('/:id', MenuController.getItemById);               // ← public (optionnel)

// ==================== ROUTES ADMIN (protégées) ====================
router.post('/categories', authMiddleware, adminMiddleware, MenuController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, MenuController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, MenuController.deleteCategory);

router.post('/', authMiddleware, adminMiddleware, MenuController.createItem);
router.put('/:id', authMiddleware, adminMiddleware, MenuController.updateItem);
router.delete('/:id', authMiddleware, adminMiddleware, MenuController.deleteItem);

export default router;