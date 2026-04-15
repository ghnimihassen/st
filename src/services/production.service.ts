import { Recipe } from '../models/Recipe.model';
import { RecipeCategory } from '../models/RecipeCategory.model';
import { Showcase } from '../models/Showcase.model';
import { ShowcaseItem } from '../models/ShowcaseItem.model';
import { ProductionOrder } from '../models/ProductionOrder.model';
import { Batch } from '../models/Batch.model';
import { Product } from '../models/Product.model';

export const ProductionService = {
  // Recipe Categories
  async getAllRecipeCategories() {
    return await RecipeCategory.find();
  },

  async createRecipeCategory(data: any) {
    const category = new RecipeCategory(data);
    await category.save();
    return category;
  },

  async updateRecipeCategory(id: string, updates: any) {
    return await RecipeCategory.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteRecipeCategory(id: string) {
    await RecipeCategory.findByIdAndDelete(id);
    return true;
  },

  // Recipes
  async getAllRecipes() {
    return await Recipe.find().populate('categoryId');
  },

  async createRecipe(data: any) {
    const recipe = new Recipe(data);
    await recipe.save();
    return recipe;
  },

  async updateRecipe(id: string, updates: any) {
    return await Recipe.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteRecipe(id: string) {
    await Recipe.findByIdAndDelete(id);
    return true;
  },

  async getRecipeCost(recipeId: string) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error('Recipe not found');
    
    let totalCost = 0;
    for (const ing of recipe.ingredients) {
      const product = await Product.findById(ing.productId);
      if (product) {
        totalCost += product.unitPrice * ing.quantity;
      }
    }
    
    const costPerUnit = recipe.yield > 0 ? totalCost / recipe.yield : totalCost;
    const margin = recipe.sellingPrice > 0 ? ((recipe.sellingPrice - costPerUnit) / recipe.sellingPrice) * 100 : 0;
    
    return { totalCost, costPerUnit, margin };
  },

  // Showcases
  async getAllShowcases() {
    return await Showcase.find();
  },

  async createShowcase(data: any) {
    const showcase = new Showcase(data);
    await showcase.save();
    return showcase;
  },

  async updateShowcase(id: string, updates: any) {
    return await Showcase.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteShowcase(id: string) {
    await Showcase.findByIdAndDelete(id);
    return true;
  },

  // Production Orders
  async getAllProductionOrders(status?: string) {
    let query: any = {};
    if (status) query.status = status;
    return await ProductionOrder.find(query).populate('recipeId').populate('showcaseId');
  },

  async createProductionOrder(data: any) {
    const order = new ProductionOrder(data);
    await order.save();
    return order;
  },

  async startProduction(orderId: string, employeeId: string) {
    const order = await ProductionOrder.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'planned') throw new Error('Order not in planned state');
    
    const recipe = await Recipe.findById(order.recipeId);
    if (!recipe) throw new Error('Recipe not found');
    
    for (const ing of recipe.ingredients) {
      const batches = await Batch.find({ productId: ing.productId });
      const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
      const needed = ing.quantity * order.quantity;
      
      if (totalStock < needed) {
        throw new Error(`Insufficient stock for ingredient ${ing.productId}`);
      }
    }
    
    for (const ing of recipe.ingredients) {
      let needed = ing.quantity * order.quantity;
      const batches = await Batch.find({ productId: ing.productId }).sort({ receptionDate: 1 });
      
      for (const batch of batches) {
        if (needed <= 0) break;
        if (batch.quantity >= needed) {
          batch.quantity -= needed;
          needed = 0;
        } else {
          needed -= batch.quantity;
          batch.quantity = 0;
        }
        await batch.save();
      }
    }
    
    order.status = 'in-progress';
    order.startedAt = new Date();
    order.producedBy = employeeId;
    await order.save();
    
    return order;
  },

  async completeProduction(orderId: string) {
    const order = await ProductionOrder.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'in-progress') throw new Error('Order not in progress');
    
    const recipe = await Recipe.findById(order.recipeId);
    if (!recipe) throw new Error('Recipe not found');
    
    const now = new Date();
    const expirationDate = new Date(now.getTime() + recipe.shelfLife * 60 * 60 * 1000);
    
    const showcaseItem = new ShowcaseItem({
      recipeId: recipe.id,
      productionOrderId: order.id,
      showcaseId: order.showcaseId,
      batchNumber: `PROD-${Date.now().toString().slice(-8)}`,
      quantity: recipe.yield * order.quantity,
      initialQuantity: recipe.yield * order.quantity,
      productionDate: now.toISOString().split('T')[0],
      productionTime: now.toTimeString().slice(0, 5),
      expirationDate: expirationDate.toISOString().split('T')[0],
      expirationTime: expirationDate.toTimeString().slice(0, 5),
      unitCost: 0,
      sellingPrice: recipe.sellingPrice,
      status: 'available',
    });
    await showcaseItem.save();
    
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
    
    return { order, showcaseItem };
  },

  async cancelProduction(orderId: string) {
    const order = await ProductionOrder.findByIdAndUpdate(
      orderId,
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) throw new Error('Order not found');
    return order;
  },

  // Showcase Items
  async getAllShowcaseItems(showcaseId?: string) {
    let query: any = {};
    if (showcaseId) query.showcaseId = showcaseId;
    return await ShowcaseItem.find(query).populate('recipeId');
  },

  async updateShowcaseItem(id: string, updates: any) {
    return await ShowcaseItem.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteShowcaseItem(id: string) {
    await ShowcaseItem.findByIdAndDelete(id);
    return true;
  },

  async transferItem(itemId: string, targetShowcaseId: string, quantity: number) {
    const sourceItem = await ShowcaseItem.findById(itemId);
    if (!sourceItem) throw new Error('Item not found');
    if (sourceItem.quantity < quantity) throw new Error('Insufficient quantity');
    
    sourceItem.quantity -= quantity;
    await sourceItem.save();
    
    const targetItem = new ShowcaseItem({
      ...sourceItem.toObject(),
      _id: undefined,
      showcaseId: targetShowcaseId,
      quantity,
      initialQuantity: quantity,
    });
    await targetItem.save();
    
    return { source: sourceItem, target: targetItem };
  },

  async getExpiringItems(hours: number = 4) {
    const now = new Date();
    const threshold = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return await ShowcaseItem.find({
      quantity: { $gt: 0 },
      expirationDate: { $lte: threshold.toISOString().split('T')[0] }
    }).populate('recipeId');
  },
};