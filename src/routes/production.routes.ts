import { Router } from 'express';
import { ProductionController } from '../controllers/production.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Recipe Categories
router.get('/recipe-categories', authMiddleware, ProductionController.getAllRecipeCategories);
router.post('/recipe-categories', authMiddleware, adminMiddleware, ProductionController.createRecipeCategory);
router.put('/recipe-categories/:id', authMiddleware, adminMiddleware, ProductionController.updateRecipeCategory);
router.delete('/recipe-categories/:id', authMiddleware, adminMiddleware, ProductionController.deleteRecipeCategory);

// Recipes
router.get('/recipes', authMiddleware, ProductionController.getAllRecipes);
router.get('/recipes/:id/cost', authMiddleware, ProductionController.getRecipeCost);
router.post('/recipes', authMiddleware, adminMiddleware, ProductionController.createRecipe);
router.put('/recipes/:id', authMiddleware, adminMiddleware, ProductionController.updateRecipe);
router.delete('/recipes/:id', authMiddleware, adminMiddleware, ProductionController.deleteRecipe);

// Showcases
router.get('/showcases', authMiddleware, ProductionController.getAllShowcases);
router.post('/showcases', authMiddleware, adminMiddleware, ProductionController.createShowcase);
router.put('/showcases/:id', authMiddleware, adminMiddleware, ProductionController.updateShowcase);
router.delete('/showcases/:id', authMiddleware, adminMiddleware, ProductionController.deleteShowcase);

// Production Orders
router.get('/production-orders', authMiddleware, ProductionController.getAllProductionOrders);
router.post('/production-orders', authMiddleware, adminMiddleware, ProductionController.createProductionOrder);
router.patch('/production-orders/:id/start', authMiddleware, adminMiddleware, ProductionController.startProduction);
router.patch('/production-orders/:id/complete', authMiddleware, adminMiddleware, ProductionController.completeProduction);
router.patch('/production-orders/:id/cancel', authMiddleware, adminMiddleware, ProductionController.cancelProduction);

// Showcase Items
router.get('/showcase-items', authMiddleware, ProductionController.getAllShowcaseItems);
router.get('/showcase-items/expiring', authMiddleware, ProductionController.getExpiringItems);
router.put('/showcase-items/:id', authMiddleware, ProductionController.updateShowcaseItem);
router.delete('/showcase-items/:id', authMiddleware, adminMiddleware, ProductionController.deleteShowcaseItem);
router.post('/showcase-items/:id/transfer', authMiddleware, ProductionController.transferItem);

export default router;