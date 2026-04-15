// backend/src/services/stock.service.ts
import { StockCategory } from '../models/StockCategory.model';
import { SubCategory } from '../models/SubCategory.model';
import { StorageLocation } from '../models/StorageLocation.model';
import { Supplier } from '../models/Supplier.model';

export const StockService = {
  // ==================== STOCK CATEGORIES ====================
  async getAllStockCategories() {
    return await StockCategory.find().sort({ order: 1 });
  },

  async getStockCategoryById(id: string) {
    return await StockCategory.findById(id);
  },

  async createStockCategory(data: any) {
    // التحقق من أن slug غير مكرر
    if (data.slug) {
      const existing = await StockCategory.findOne({ slug: data.slug });
      if (existing) {
        throw new Error(`Stock category with slug "${data.slug}" already exists`);
      }
    }
    const category = new StockCategory(data);
    await category.save();
    return category;
  },

  async updateStockCategory(id: string, updates: any) {
    // إذا تم تعديل slug، نتحقق من عدم تكراره مع تصنيف آخر
    if (updates.slug) {
      const existing = await StockCategory.findOne({ 
        slug: updates.slug, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new Error(`Stock category with slug "${updates.slug}" already exists`);
      }
    }
    return await StockCategory.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteStockCategory(id: string) {
    await StockCategory.findByIdAndDelete(id);
    return true;
  },

  // ==================== SUB CATEGORIES ====================
  async getAllSubCategories(categoryId?: string) {
    let query: any = {};
    if (categoryId) query.categoryId = categoryId;
    return await SubCategory.find(query).sort({ order: 1 });
  },

  async getSubCategoryById(id: string) {
    return await SubCategory.findById(id);
  },

  async createSubCategory(data: any) {
    // التحقق من slug فريد
    if (data.slug) {
      const existing = await SubCategory.findOne({ slug: data.slug });
      if (existing) {
        throw new Error(`Sub-category with slug "${data.slug}" already exists`);
      }
    }
    const sub = new SubCategory(data);
    await sub.save();
    return sub;
  },

  async updateSubCategory(id: string, updates: any) {
    if (updates.slug) {
      const existing = await SubCategory.findOne({ 
        slug: updates.slug, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new Error(`Sub-category with slug "${updates.slug}" already exists`);
      }
    }
    return await SubCategory.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteSubCategory(id: string) {
    await SubCategory.findByIdAndDelete(id);
    return true;
  },

  // ==================== STORAGE LOCATIONS ====================
  async getAllStorageLocations() {
    return await StorageLocation.find().sort({ name: 1 });
  },

  async getStorageLocationById(id: string) {
    return await StorageLocation.findById(id);
  },

  async createStorageLocation(data: any) {
    const location = new StorageLocation(data);
    await location.save();
    return location;
  },

  async updateStorageLocation(id: string, updates: any) {
    return await StorageLocation.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteStorageLocation(id: string) {
    await StorageLocation.findByIdAndDelete(id);
    return true;
  },

  // ==================== SUPPLIERS ====================
  async getAllSuppliers() {
    return await Supplier.find().sort({ name: 1 });
  },

  async getSupplierById(id: string) {
    return await Supplier.findById(id);
  },

  async createSupplier(data: any) {
    const supplier = new Supplier(data);
    await supplier.save();
    return supplier;
  },

  async updateSupplier(id: string, updates: any) {
    return await Supplier.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteSupplier(id: string) {
    await Supplier.findByIdAndDelete(id);
    return true;
  },
};