import { Batch } from '../models/Batch.model';
import { Product } from '../models/Product.model';
import { Types } from 'mongoose';

// Types
interface BatchFilters {
  productId?: string;
  supplierId?: string;
  locationId?: string;
  isOpened?: boolean;
  startDate?: string;
  endDate?: string;
}

export const BatchService = {
  async getAllBatches(filters: BatchFilters = {}) {
    const query: any = {};
    
    if (filters.productId) query.productId = new Types.ObjectId(filters.productId);
    if (filters.supplierId) query.supplierId = new Types.ObjectId(filters.supplierId);
    if (filters.locationId) query.locationId = new Types.ObjectId(filters.locationId);
    if (filters.isOpened !== undefined) query.isOpened = filters.isOpened;
    
    if (filters.startDate || filters.endDate) {
      query.receptionDate = {};
      if (filters.startDate) query.receptionDate.$gte = filters.startDate;
      if (filters.endDate) query.receptionDate.$lte = filters.endDate;
    }
    
    const batches = await Batch.find(query)
      .sort({ receptionDate: 1 })
      .populate('productId', 'name unit unitPrice')
      .populate('supplierId', 'name contactName')
      .populate('locationId', 'name type temperature')
      .lean();
    
    return batches;
  },

  async getBatchById(id: string) {
    const batch = await Batch.findById(id)
      .populate('productId', 'name unit unitPrice shelfLifeAfterOpening')
      .populate('supplierId', 'name contactName phone')
      .populate('locationId', 'name type temperature')
      .lean();
    
    if (!batch) {
      throw new Error('Batch not found');
    }
    
    return batch;
  },

  async getBatchByNumber(batchNumber: string) {
    const batch = await Batch.findOne({ batchNumber })
      .populate('productId', 'name unit unitPrice')
      .populate('supplierId', 'name contactName')
      .populate('locationId', 'name type')
      .lean();
    
    if (!batch) {
      throw new Error('Batch not found');
    }
    
    return batch;
  },

  async getBatchesByProduct(productId: string) {
    const batches = await Batch.find({ productId: new Types.ObjectId(productId) })
      .sort({ receptionDate: 1 })
      .populate('supplierId', 'name contactName')
      .populate('locationId', 'name type')
      .lean();
    
    return batches;
  },

  async getActiveBatchesByProduct(productId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const batches = await Batch.find({
      productId: new Types.ObjectId(productId),
      quantity: { $gt: 0 },
      $or: [
        { isOpened: false, expirationDate: { $gte: today } },
        { isOpened: true, expirationAfterOpening: { $gte: today } }
      ]
    })
      .sort({ receptionDate: 1 })
      .lean();
    
    return batches;
  },

  async createBatch(data: any) {
    // Validation des données
    if (!data.productId) throw new Error('Product ID is required');
    if (!data.batchNumber) throw new Error('Batch number is required');
    if (!data.quantity || data.quantity <= 0) throw new Error('Valid quantity is required');
    if (!data.expirationDate) throw new Error('Expiration date is required');
    
    // Vérifier si le lot existe déjà
    const existingBatch = await Batch.findOne({ batchNumber: data.batchNumber });
    if (existingBatch) {
      throw new Error(`Batch with number ${data.batchNumber} already exists`);
    }
    
    const batch = new Batch({
      ...data,
      productId: new Types.ObjectId(data.productId),
      supplierId: data.supplierId ? new Types.ObjectId(data.supplierId) : undefined,
      locationId: data.locationId ? new Types.ObjectId(data.locationId) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await batch.save();
    return batch.toObject();
  },

  async updateBatch(id: string, updates: any) {
    const batch = await Batch.findById(id);
    if (!batch) {
      throw new Error('Batch not found');
    }
    
    // Convertir les ObjectId si nécessaires
    if (updates.productId) updates.productId = new Types.ObjectId(updates.productId);
    if (updates.supplierId) updates.supplierId = new Types.ObjectId(updates.supplierId);
    if (updates.locationId) updates.locationId = new Types.ObjectId(updates.locationId);
    
    updates.updatedAt = new Date();
    
    const updatedBatch = await Batch.findByIdAndUpdate(id, updates, { 
      new: true, 
      lean: true 
    });
    
    return updatedBatch;
  },

  async deleteBatch(id: string) {
    const batch = await Batch.findById(id);
    if (!batch) {
      throw new Error('Batch not found');
    }
    
    await Batch.findByIdAndDelete(id);
    return { success: true, message: 'Batch deleted successfully' };
  },

  async openBatch(id: string, openingDate: string) {
    const batch = await Batch.findById(id);
    if (!batch) throw new Error('Batch not found');
    
    if (batch.isOpened) {
      throw new Error('Batch is already opened');
    }
    
    const product = await Product.findById(batch.productId);
    
    batch.isOpened = true;
    batch.openingDate = openingDate;
    
    if (product?.shelfLifeAfterOpening) {
      const expDate = new Date(openingDate);
      expDate.setDate(expDate.getDate() + product.shelfLifeAfterOpening);
      batch.expirationAfterOpening = expDate.toISOString().split('T')[0];
    }
    
    batch.updatedAt = new Date();
    await batch.save();
    
    return batch.toObject();
  },

  async consumeBatch(id: string, quantity: number) {
    const batch = await Batch.findById(id);
    if (!batch) throw new Error('Batch not found');
    
    if (batch.quantity < quantity) {
      throw new Error(`Insufficient quantity. Available: ${batch.quantity}, Requested: ${quantity}`);
    }
    
    batch.quantity -= quantity;
    batch.updatedAt = new Date();
    await batch.save();
    
    return batch.toObject();
  },

  async consumeFromBatches(productId: string, quantity: number) {
    const batches = await this.getActiveBatchesByProduct(productId);
    let remainingQuantity = quantity;
    const consumedBatches: any[] = [];
    
    for (const batch of batches) {
      if (remainingQuantity <= 0) break;
      
      const consumeQuantity = Math.min(batch.quantity, remainingQuantity);
      await this.consumeBatch(batch._id.toString(), consumeQuantity);
      
      consumedBatches.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        consumedQuantity: consumeQuantity,
      });
      
      remainingQuantity -= consumeQuantity;
    }
    
    if (remainingQuantity > 0) {
      throw new Error(`Insufficient total stock. Missing: ${remainingQuantity} units`);
    }
    
    return {
      success: true,
      consumedBatches,
      totalConsumed: quantity - remainingQuantity,
    };
  },

  async getExpiringBatches(days: number = 30) {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0] ?? '';
    const thresholdStr = threshold.toISOString().split('T')[0] ?? '';
    
    const batches = await Batch.find({
      $or: [
        { 
          isOpened: false, 
          expirationDate: { 
            $gte: todayStr, 
            $lte: thresholdStr 
          } 
        },
        { 
          isOpened: true, 
          expirationAfterOpening: { 
            $gte: todayStr, 
            $lte: thresholdStr 
          } 
        }
      ],
      quantity: { $gt: 0 }
    }).populate('productId', 'name unit');
    
    const result = [];
    for (const batch of batches) {
      const expDate = batch.isOpened ? batch.expirationAfterOpening : batch.expirationDate;
      if (expDate) {
        const daysLeft = Math.ceil(
          (new Date(expDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        result.push({
          ...batch.toObject(),
          daysLeft,
        });
      }
    }
    
    // Trier par date d'expiration (les plus proches d'abord)
    return result.sort((a, b) => a.daysLeft - b.daysLeft);
  },

  async getLowStockBatches(threshold: number = 10) {
    const batches = await Batch.find({
      quantity: { $lte: threshold, $gt: 0 }
    })
      .populate('productId', 'name unit minQuantity')
      .sort({ quantity: 1 })
      .lean();
    
    return batches;
  },

  async getExpiredBatches() {
    const todayStr = new Date().toISOString().split('T')[0] ?? '';
    
    const batches = await Batch.find({
      quantity: { $gt: 0 },
      $or: [
        { isOpened: false, expirationDate: { $lt: todayStr } },
        { isOpened: true, expirationAfterOpening: { $lt: todayStr } }
      ]
    }).populate('productId', 'name unit');
    
    return batches;
  },

  async getBatchStats() {
    const totalBatches = await Batch.countDocuments();
    const activeBatches = await Batch.countDocuments({ quantity: { $gt: 0 } });
    const openedBatches = await Batch.countDocuments({ isOpened: true });
    const closedBatches = await Batch.countDocuments({ isOpened: false, quantity: { $gt: 0 } });
    
    const totalQuantity = await Batch.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    
    const expiringSoon = await this.getExpiringBatches(7);
    const expired = await this.getExpiredBatches();
    
    return {
      totalBatches,
      activeBatches,
      openedBatches,
      closedBatches,
      totalQuantity: totalQuantity[0]?.total || 0,
      expiringSoonCount: expiringSoon.length,
      expiredCount: expired.length,
    };
  },

  async transferBatch(batchId: string, newLocationId: string) {
    const batch = await Batch.findById(batchId);
    if (!batch) throw new Error('Batch not found');
    
    batch.locationId = new Types.ObjectId(newLocationId);
    batch.updatedAt = new Date();
    await batch.save();
    
    return batch.toObject();
  },

  async splitBatch(batchId: string, quantity: number, newBatchNumber: string) {
    const originalBatch = await Batch.findById(batchId);
    if (!originalBatch) throw new Error('Original batch not found');
    
    if (quantity >= originalBatch.quantity) {
      throw new Error('Split quantity must be less than original batch quantity');
    }
    
    // Reduce original batch
    originalBatch.quantity -= quantity;
    originalBatch.updatedAt = new Date();
    await originalBatch.save();
    
    // Create new batch
    const newBatch = new Batch({
      ...originalBatch.toObject(),
      _id: undefined,
      batchNumber: newBatchNumber,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newBatch.save();
    
    return {
      originalBatch: originalBatch.toObject(),
      newBatch: newBatch.toObject(),
    };
  },
};