import type { Request, Response } from 'express';
import { ProductionService } from '../services/production.service';
import { successResponse, errorResponse } from '../utils/response';

export const ProductionController = {
  // Recipe Categories
  async getAllRecipeCategories(req: Request, res: Response) {
    try {
      const categories = await ProductionService.getAllRecipeCategories();
      successResponse(res, categories);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createRecipeCategory(req: Request, res: Response) {
    try {
      const categoryData = req.body;
      
      if (!categoryData.name) {
        return errorResponse(res, 'Category name is required', 400);
      }
      
      const category = await ProductionService.createRecipeCategory(categoryData);
      successResponse(res, category, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateRecipeCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid category ID is required', 400);
      }
      
      const category = await ProductionService.updateRecipeCategory(id, updates);
      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }
      
      successResponse(res, category);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteRecipeCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid category ID is required', 400);
      }
      
      await ProductionService.deleteRecipeCategory(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // Recipes
  async getAllRecipes(req: Request, res: Response) {
    try {
      const recipes = await ProductionService.getAllRecipes();
      successResponse(res, recipes);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getRecipeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid recipe ID is required', 400);
      }
      
      const recipes = await ProductionService.getAllRecipes();
      const recipe = recipes.find(r => r._id.toString() === id);
      
      if (!recipe) {
        return errorResponse(res, 'Recipe not found', 404);
      }
      
      successResponse(res, recipe);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createRecipe(req: Request, res: Response) {
    try {
      const recipeData = req.body;
      
      // Validation
      if (!recipeData.name) {
        return errorResponse(res, 'Recipe name is required', 400);
      }
      if (!recipeData.categoryId) {
        return errorResponse(res, 'Category ID is required', 400);
      }
      if (!recipeData.sellingPrice || recipeData.sellingPrice <= 0) {
        return errorResponse(res, 'Valid selling price is required', 400);
      }
      
      const recipe = await ProductionService.createRecipe(recipeData);
      successResponse(res, recipe, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateRecipe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid recipe ID is required', 400);
      }
      
      const recipe = await ProductionService.updateRecipe(id, updates);
      if (!recipe) {
        return errorResponse(res, 'Recipe not found', 404);
      }
      
      successResponse(res, recipe);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteRecipe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid recipe ID is required', 400);
      }
      
      await ProductionService.deleteRecipe(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getRecipeCost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid recipe ID is required', 400);
      }
      
      const cost = await ProductionService.getRecipeCost(id);
      successResponse(res, cost);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // Showcases
  async getAllShowcases(req: Request, res: Response) {
    try {
      const showcases = await ProductionService.getAllShowcases();
      successResponse(res, showcases);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getShowcaseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid showcase ID is required', 400);
      }
      
      const showcases = await ProductionService.getAllShowcases();
      const showcase = showcases.find(s => s._id.toString() === id);
      
      if (!showcase) {
        return errorResponse(res, 'Showcase not found', 404);
      }
      
      successResponse(res, showcase);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createShowcase(req: Request, res: Response) {
    try {
      const showcaseData = req.body;
      
      if (!showcaseData.name) {
        return errorResponse(res, 'Showcase name is required', 400);
      }
      if (!showcaseData.type) {
        return errorResponse(res, 'Showcase type is required', 400);
      }
      if (!showcaseData.location) {
        return errorResponse(res, 'Showcase location is required', 400);
      }
      
      const showcase = await ProductionService.createShowcase(showcaseData);
      successResponse(res, showcase, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateShowcase(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid showcase ID is required', 400);
      }
      
      const showcase = await ProductionService.updateShowcase(id, updates);
      if (!showcase) {
        return errorResponse(res, 'Showcase not found', 404);
      }
      
      successResponse(res, showcase);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteShowcase(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid showcase ID is required', 400);
      }
      
      await ProductionService.deleteShowcase(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // Production Orders
  async getAllProductionOrders(req: Request, res: Response) {
    try {
      let status: string | undefined;
      
      if (req.query.status && typeof req.query.status === 'string') {
        status = req.query.status;
      }
      
      const orders = await ProductionService.getAllProductionOrders(status);
      successResponse(res, orders);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getProductionOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const orders = await ProductionService.getAllProductionOrders();
      const order = orders.find(o => o._id.toString() === id);
      
      if (!order) {
        return errorResponse(res, 'Production order not found', 404);
      }
      
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async createProductionOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      
      if (!orderData.recipeId) {
        return errorResponse(res, 'Recipe ID is required', 400);
      }
      if (!orderData.showcaseId) {
        return errorResponse(res, 'Showcase ID is required', 400);
      }
      if (!orderData.quantity || orderData.quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }
      if (!orderData.scheduledDate) {
        return errorResponse(res, 'Scheduled date is required', 400);
      }
      
      const order = await ProductionService.createProductionOrder(orderData);
      successResponse(res, order, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async startProduction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employeeId = (req as any).user?.id;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const order = await ProductionService.startProduction(id, employeeId);
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async completeProduction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const result = await ProductionService.completeProduction(id);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async cancelProduction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const order = await ProductionService.cancelProduction(id);
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // Showcase Items
  async getAllShowcaseItems(req: Request, res: Response) {
    try {
      let showcaseId: string | undefined;
      
      if (req.query.showcaseId && typeof req.query.showcaseId === 'string') {
        showcaseId = req.query.showcaseId;
      }
      
      const items = await ProductionService.getAllShowcaseItems(showcaseId);
      successResponse(res, items);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getShowcaseItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid item ID is required', 400);
      }
      
      const items = await ProductionService.getAllShowcaseItems();
      const item = items.find(i => i._id.toString() === id);
      
      if (!item) {
        return errorResponse(res, 'Showcase item not found', 404);
      }
      
      successResponse(res, item);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateShowcaseItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid item ID is required', 400);
      }
      
      const item = await ProductionService.updateShowcaseItem(id, updates);
      if (!item) {
        return errorResponse(res, 'Showcase item not found', 404);
      }
      
      successResponse(res, item);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteShowcaseItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid item ID is required', 400);
      }
      
      await ProductionService.deleteShowcaseItem(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async transferItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { targetShowcaseId, quantity } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid item ID is required', 400);
      }
      if (!targetShowcaseId || typeof targetShowcaseId !== 'string') {
        return errorResponse(res, 'Valid target showcase ID is required', 400);
      }
      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }
      
      const result = await ProductionService.transferItem(id, targetShowcaseId, quantity);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getExpiringItems(req: Request, res: Response) {
    try {
      let hours = 4;
      
      if (req.query.hours && typeof req.query.hours === 'string') {
        const parsedHours = parseInt(req.query.hours, 10);
        if (!isNaN(parsedHours) && parsedHours > 0) {
          hours = parsedHours;
        }
      }
      
      const items = await ProductionService.getExpiringItems(hours);
      successResponse(res, items);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};