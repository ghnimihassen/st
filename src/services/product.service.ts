import { Product } from '../models/Product.model';
import { Batch } from '../models/Batch.model';

export const ProductService = {
  async getAllProducts(filters: { subCategoryId?: string; search?: string }) {
    let query: any = {};
    if (filters.subCategoryId) query.subCategoryId = filters.subCategoryId;
    if (filters.search) query.name = { $regex: filters.search, $options: 'i' };
    
    return await Product.find(query).populate('subCategoryId').sort({ name: 1 });
  },

  async getProductById(id: string) {
    return await Product.findById(id).populate('subCategoryId');
  },

  async createProduct(data: any) {
    const product = new Product(data);
    await product.save();
    return product;
  },

  async updateProduct(id: string, updates: any) {
    return await Product.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteProduct(id: string) {
    await Product.findByIdAndDelete(id);
    return true;
  },

  async getProductStock(productId: string) {
    const batches = await Batch.find({ productId });
    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
    return { productId, stock: totalStock };
  },

  async getLowStockProducts() {
    const products = await Product.find({ isActive: true });
    const lowStock: any[] = [];
    
    for (const product of products) {
      const batches = await Batch.find({ productId: product.id });
      const stock = batches.reduce((sum, b) => sum + b.quantity, 0);
      if (stock <= product.minQuantity) {
        lowStock.push({ ...product.toObject(), currentStock: stock });
      }
    }
    
    return lowStock;
  },
};