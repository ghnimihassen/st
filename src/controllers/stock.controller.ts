import type { Request, Response } from 'express';
import { StockService } from '../services/stock.service';
import { successResponse, errorResponse } from '../utils/response';

export const StockController = {
  // ==================== STOCK CATEGORIES ====================
  async getAllStockCategories(req: Request, res: Response) {
    try {
      const categories = await StockService.getAllStockCategories();
      successResponse(res, categories);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStockCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid category ID is required', 400);
      }
      
      const category = await StockService.getStockCategoryById(id);
      
      if (!category) {
        return errorResponse(res, 'Stock category not found', 404);
      }
      
      successResponse(res, category);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createStockCategory(req: Request, res: Response) {
    try {
      const categoryData = req.body;
      
      if (!categoryData.name) {
        return errorResponse(res, 'Category name is required', 400);
      }
      if (!categoryData.slug) {
        return errorResponse(res, 'Category slug is required', 400);
      }
      
      const category = await StockService.createStockCategory(categoryData);
      successResponse(res, category, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateStockCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid category ID is required', 400);
      }
      
      const category = await StockService.updateStockCategory(id, updates);
      if (!category) {
        return errorResponse(res, 'Stock category not found', 404);
      }
      
      successResponse(res, category);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteStockCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid category ID is required', 400);
      }
      
      await StockService.deleteStockCategory(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ==================== SUB CATEGORIES ====================
  async getAllSubCategories(req: Request, res: Response) {
    try {
      let categoryId: string | undefined;
      
      if (req.query.categoryId && typeof req.query.categoryId === 'string') {
        categoryId = req.query.categoryId;
      }
      
      const subs = await StockService.getAllSubCategories(categoryId);
      successResponse(res, subs);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getSubCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid sub-category ID is required', 400);
      }
      
      const sub = await StockService.getSubCategoryById(id);
      
      if (!sub) {
        return errorResponse(res, 'Sub-category not found', 404);
      }
      
      successResponse(res, sub);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createSubCategory(req: Request, res: Response) {
    try {
      const subData = req.body;
      
      if (!subData.name) {
        return errorResponse(res, 'Sub-category name is required', 400);
      }
      if (!subData.categoryId) {
        return errorResponse(res, 'Category ID is required', 400);
      }
      if (!subData.slug) {
        return errorResponse(res, 'Sub-category slug is required', 400);
      }
      
      const sub = await StockService.createSubCategory(subData);
      successResponse(res, sub, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid sub-category ID is required', 400);
      }
      
      const sub = await StockService.updateSubCategory(id, updates);
      if (!sub) {
        return errorResponse(res, 'Sub-category not found', 404);
      }
      
      successResponse(res, sub);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid sub-category ID is required', 400);
      }
      
      await StockService.deleteSubCategory(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ==================== STORAGE LOCATIONS ====================
  async getAllStorageLocations(req: Request, res: Response) {
    try {
      const locations = await StockService.getAllStorageLocations();
      successResponse(res, locations);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStorageLocationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid location ID is required', 400);
      }
      
      const location = await StockService.getStorageLocationById(id);
      
      if (!location) {
        return errorResponse(res, 'Storage location not found', 404);
      }
      
      successResponse(res, location);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createStorageLocation(req: Request, res: Response) {
    try {
      const locationData = req.body;
      
      if (!locationData.name) {
        return errorResponse(res, 'Location name is required', 400);
      }
      if (!locationData.type) {
        return errorResponse(res, 'Location type is required', 400);
      }
      
      const validTypes = ['refrigerator', 'freezer', 'room', 'shelf', 'other'];
      if (!validTypes.includes(locationData.type)) {
        return errorResponse(res, `Invalid type. Must be one of: ${validTypes.join(', ')}`, 400);
      }
      
      const location = await StockService.createStorageLocation(locationData);
      successResponse(res, location, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateStorageLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid location ID is required', 400);
      }
      
      const location = await StockService.updateStorageLocation(id, updates);
      if (!location) {
        return errorResponse(res, 'Storage location not found', 404);
      }
      
      successResponse(res, location);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteStorageLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid location ID is required', 400);
      }
      
      await StockService.deleteStorageLocation(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ==================== SUPPLIERS ====================
  async getAllSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await StockService.getAllSuppliers();
      successResponse(res, suppliers);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getSupplierById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid supplier ID is required', 400);
      }
      
      const supplier = await StockService.getSupplierById(id);
      
      if (!supplier) {
        return errorResponse(res, 'Supplier not found', 404);
      }
      
      successResponse(res, supplier);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createSupplier(req: Request, res: Response) {
    try {
      const supplierData = req.body;
      
      if (!supplierData.name) {
        return errorResponse(res, 'Supplier name is required', 400);
      }
      
      const supplier = await StockService.createSupplier(supplierData);
      successResponse(res, supplier, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid supplier ID is required', 400);
      }
      
      const supplier = await StockService.updateSupplier(id, updates);
      if (!supplier) {
        return errorResponse(res, 'Supplier not found', 404);
      }
      
      successResponse(res, supplier);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid supplier ID is required', 400);
      }
      
      await StockService.deleteSupplier(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ==================== STATS ====================
  async getStockStats(req: Request, res: Response) {
    try {
      const categories = await StockService.getAllStockCategories();
      const subCategories = await StockService.getAllSubCategories();
      const locations = await StockService.getAllStorageLocations();
      const suppliers = await StockService.getAllSuppliers();
      
      const stats = {
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.isActive).length,
        totalSubCategories: subCategories.length,
        activeSubCategories: subCategories.filter(s => s.isActive).length,
        totalLocations: locations.length,
        activeLocations: locations.filter(l => l.isActive).length,
        totalSuppliers: suppliers.length,
        activeSuppliers: suppliers.filter(s => s.status === 'active').length,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};