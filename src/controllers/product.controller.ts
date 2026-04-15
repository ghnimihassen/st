import type { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export const ProductController = {
  async getAll(req: Request, res: Response) {
    try {
      // Récupération sécurisée des paramètres de requête
      let subCategoryId: string | undefined;
      let search: string | undefined;
      
      if (req.query.subCategoryId && typeof req.query.subCategoryId === 'string') {
        subCategoryId = req.query.subCategoryId;
      }
      if (req.query.search && typeof req.query.search === 'string') {
        search = req.query.search;
      }
      
      const products = await ProductService.getAllProducts({ subCategoryId, search });
      successResponse(res, products);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      
      const product = await ProductService.getProductById(id);
      if (!product) return errorResponse(res, 'Product not found', 404);
      successResponse(res, product);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const productData = req.body;
      
      // Validation des données
      if (!productData.name) {
        return errorResponse(res, 'Product name is required', 400);
      }
      if (!productData.subCategoryId) {
        return errorResponse(res, 'Sub-category ID is required', 400);
      }
      if (!productData.unit) {
        return errorResponse(res, 'Unit is required', 400);
      }
      if (productData.unitPrice === undefined || productData.unitPrice < 0) {
        return errorResponse(res, 'Valid unit price is required', 400);
      }
      
      const product = await ProductService.createProduct(productData);
      successResponse(res, product, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      
      const product = await ProductService.updateProduct(id, updates);
      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }
      
      successResponse(res, product);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      
      await ProductService.deleteProduct(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      
      const stock = await ProductService.getProductStock(id);
      successResponse(res, stock);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getLowStock(req: Request, res: Response) {
    try {
      const lowStock = await ProductService.getLowStockProducts();
      successResponse(res, lowStock);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getBySubCategory(req: Request, res: Response) {
    try {
      const { subCategoryId } = req.params;
      
      if (!subCategoryId || typeof subCategoryId !== 'string') {
        return errorResponse(res, 'Valid sub-category ID is required', 400);
      }
      
      const products = await ProductService.getAllProducts({ subCategoryId });
      successResponse(res, products);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // Calcul des statistiques directement dans le contrôleur
  async getProductStats(req: Request, res: Response) {
    try {
      const allProducts = await ProductService.getAllProducts({});
      const lowStockProducts = await ProductService.getLowStockProducts();
      
      const totalProducts = allProducts.length;
      const activeProducts = allProducts.filter(p => p.isActive).length;
      const lowStockCount = lowStockProducts.length;
      
      const stats = {
        totalProducts,
        activeProducts,
        lowStockCount,
        healthyStockCount: activeProducts - lowStockCount,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};