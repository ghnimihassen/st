import { Router } from 'express';
import  { StockController } from '../controllers/stock.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ==================== STOCK CATEGORIES ====================
router.get('/stock-categories', authMiddleware, StockController.getAllStockCategories);
router.get('/stock-categories/:id', authMiddleware, StockController.getStockCategoryById);
router.post('/stock-categories', authMiddleware, adminMiddleware, StockController.createStockCategory);
router.put('/stock-categories/:id', authMiddleware, adminMiddleware, StockController.updateStockCategory);
router.delete('/stock-categories/:id', authMiddleware, adminMiddleware, StockController.deleteStockCategory);

// ==================== LEGACY CATEGORIES (Alias pour compatibilité frontend) ====================
router.get('/categories', authMiddleware, StockController.getAllStockCategories);
router.get('/categories/:id', authMiddleware, StockController.getStockCategoryById);
router.post('/categories', authMiddleware, adminMiddleware, StockController.createStockCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, StockController.updateStockCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, StockController.deleteStockCategory);

// ==================== SUB CATEGORIES ====================
router.get('/sub-categories', authMiddleware, StockController.getAllSubCategories);
router.get('/sub-categories/:id', authMiddleware, StockController.getSubCategoryById);
router.post('/sub-categories', authMiddleware, adminMiddleware, StockController.createSubCategory);
router.put('/sub-categories/:id', authMiddleware, adminMiddleware, StockController.updateSubCategory);
router.delete('/sub-categories/:id', authMiddleware, adminMiddleware, StockController.deleteSubCategory);

// ==================== STORAGE LOCATIONS ====================
router.get('/storage-locations', authMiddleware, StockController.getAllStorageLocations);
router.get('/storage-locations/:id', authMiddleware, StockController.getStorageLocationById);
router.post('/storage-locations', authMiddleware, adminMiddleware, StockController.createStorageLocation);
router.put('/storage-locations/:id', authMiddleware, adminMiddleware, StockController.updateStorageLocation);
router.delete('/storage-locations/:id', authMiddleware, adminMiddleware, StockController.deleteStorageLocation);

// ==================== SUPPLIERS ====================
router.get('/suppliers', authMiddleware, StockController.getAllSuppliers);
router.get('/suppliers/:id', authMiddleware, StockController.getSupplierById);
router.post('/suppliers', authMiddleware, adminMiddleware, StockController.createSupplier);
router.put('/suppliers/:id', authMiddleware, adminMiddleware, StockController.updateSupplier);
router.delete('/suppliers/:id', authMiddleware, adminMiddleware, StockController.deleteSupplier);

// ==================== STATS ====================
router.get('/stock/stats', authMiddleware, adminMiddleware, StockController.getStockStats);

export default router;