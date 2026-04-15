import type { Request, Response } from 'express';
import { BatchService } from '../services/batch.service';
import { successResponse, errorResponse } from '../utils/response';

export const BatchController = {
  async getByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      if (!productId || typeof productId !== 'string') {
        return errorResponse(res, 'Valid Product ID is required', 400);
      }
      
      const batches = await BatchService.getBatchesByProduct(productId);
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const batchData = req.body;
      
      if (!batchData.productId) {
        return errorResponse(res, 'Product ID is required', 400);
      }
      if (!batchData.batchNumber) {
        return errorResponse(res, 'Batch number is required', 400);
      }
      if (!batchData.quantity || batchData.quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }
      if (!batchData.expirationDate) {
        return errorResponse(res, 'Expiration date is required', 400);
      }
      
      const batch = await BatchService.createBatch(batchData);
      successResponse(res, batch, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      const batch = await BatchService.updateBatch(id, updates);
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      await BatchService.deleteBatch(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async open(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { openingDate } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      if (!openingDate || typeof openingDate !== 'string') {
        return errorResponse(res, 'Valid opening date is required', 400);
      }
      
      const batch = await BatchService.openBatch(id, openingDate);
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getExpiring(req: Request, res: Response) {
    try {
      let days = 30;
      const daysParam = req.query.days;
      
      if (daysParam && typeof daysParam === 'string') {
        const parsedDays = parseInt(daysParam, 10);
        if (!isNaN(parsedDays) && parsedDays > 0) {
          days = parsedDays;
        }
      }
      
      const batches = await BatchService.getExpiringBatches(days);
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      const batch = await BatchService.getBatchById(id);
      if (!batch) {
        return errorResponse(res, 'Batch not found', 404);
      }
      
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByBatchNumber(req: Request, res: Response) {
    try {
      const { batchNumber } = req.params;
      
      if (!batchNumber || typeof batchNumber !== 'string') {
        return errorResponse(res, 'Valid batch number is required', 400);
      }
      
      const batch = await BatchService.getBatchByNumber(batchNumber);
      if (!batch) {
        return errorResponse(res, 'Batch not found', 404);
      }
      
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async consume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }
      
      const batch = await BatchService.consumeBatch(id, quantity);
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getLowStockBatches(req: Request, res: Response) {
    try {
      let threshold = 10;
      const thresholdParam = req.query.threshold;
      
      if (thresholdParam && typeof thresholdParam === 'string') {
        const parsedThreshold = parseInt(thresholdParam, 10);
        if (!isNaN(parsedThreshold) && parsedThreshold > 0) {
          threshold = parsedThreshold;
        }
      }
      
      const batches = await BatchService.getLowStockBatches(threshold);
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const filters: any = {};
      
      if (req.query.productId && typeof req.query.productId === 'string') {
        filters.productId = req.query.productId;
      }
      if (req.query.supplierId && typeof req.query.supplierId === 'string') {
        filters.supplierId = req.query.supplierId;
      }
      if (req.query.locationId && typeof req.query.locationId === 'string') {
        filters.locationId = req.query.locationId;
      }
      if (req.query.isOpened !== undefined) {
        filters.isOpened = req.query.isOpened === 'true';
      }
      if (req.query.startDate && typeof req.query.startDate === 'string') {
        filters.startDate = req.query.startDate;
      }
      if (req.query.endDate && typeof req.query.endDate === 'string') {
        filters.endDate = req.query.endDate;
      }
      
      const batches = await BatchService.getAllBatches(filters);
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getActiveByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      if (!productId || typeof productId !== 'string') {
        return errorResponse(res, 'Valid Product ID is required', 400);
      }
      
      const batches = await BatchService.getActiveBatchesByProduct(productId);
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getExpired(req: Request, res: Response) {
    try {
      const batches = await BatchService.getExpiredBatches();
      successResponse(res, batches);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await BatchService.getBatchStats();
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async transfer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newLocationId } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      if (!newLocationId || typeof newLocationId !== 'string') {
        return errorResponse(res, 'Valid new location ID is required', 400);
      }
      
      const batch = await BatchService.transferBatch(id, newLocationId);
      successResponse(res, batch);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async split(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, newBatchNumber } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid Batch ID is required', 400);
      }
      
      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }
      
      if (!newBatchNumber || typeof newBatchNumber !== 'string') {
        return errorResponse(res, 'Valid new batch number is required', 400);
      }
      
      const result = await BatchService.splitBatch(id, quantity, newBatchNumber);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};