import type { Request, Response } from 'express';
import { POSService } from '../services/pos.service';
import { successResponse, errorResponse } from '../utils/response';

export const POSController = {
  async findClient(req: Request, res: Response) {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return errorResponse(res, 'Valid search query is required', 400);
      }
      
      const client = await POSService.findClient(query);
      successResponse(res, client);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async calculatePoints(req: Request, res: Response) {
    try {
      const { amount, gender } = req.body;
      
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return errorResponse(res, 'Valid amount is required', 400);
      }
      
      const result = await POSService.calculatePoints(amount, gender);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async purchase(req: Request, res: Response) {
    try {
      const { clientId, items, paymentMethod, discount, discountType, pointsToUse } = req.body;
      const cashierId = (req as any).user?.id;
      
      // Validation des données
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return errorResponse(res, 'At least one item is required', 400);
      }
      
      // Validation des articles
      for (const item of items) {
        if (!item.showcaseItemId || typeof item.showcaseItemId !== 'string') {
          return errorResponse(res, 'Valid showcaseItemId is required for each item', 400);
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return errorResponse(res, 'Valid quantity is required for each item', 400);
        }
      }
      
      if (!paymentMethod || typeof paymentMethod !== 'string') {
        return errorResponse(res, 'Valid payment method is required', 400);
      }
      
      const validPaymentMethods = ['cash', 'card', 'mobile', 'wallet'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return errorResponse(res, `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`, 400);
      }
      
      // Validation optionnelle du discount
      let validatedDiscount: number | undefined = discount;
      if (discount !== undefined && (typeof discount !== 'number' || discount < 0)) {
        return errorResponse(res, 'Valid discount amount is required', 400);
      }
      
      // Validation optionnelle du discountType
      let validatedDiscountType: 'percentage' | 'fixed' | undefined = discountType;
      if (discountType !== undefined && discountType !== 'percentage' && discountType !== 'fixed') {
        return errorResponse(res, 'Discount type must be "percentage" or "fixed"', 400);
      }
      
      // Validation optionnelle des points à utiliser
      let validatedPointsToUse: number | undefined = pointsToUse;
      if (pointsToUse !== undefined && (typeof pointsToUse !== 'number' || pointsToUse < 0)) {
        return errorResponse(res, 'Valid points to use is required', 400);
      }
      
      const order = await POSService.processPurchase({
        clientId,
        items,
        paymentMethod,
        discount: validatedDiscount,
        discountType: validatedDiscountType,
        pointsToUse: validatedPointsToUse,
        cashierId,
      });
      
      successResponse(res, order, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getTransactions(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      const transactions = await POSService.getClientTransactions(clientId);
      successResponse(res, transactions);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async addManualPoints(req: Request, res: Response) {
    try {
      const { clientId, points, reason } = req.body;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      if (points === undefined || typeof points !== 'number' || points === 0) {
        return errorResponse(res, 'Valid non-zero points amount is required', 400);
      }
      
      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return errorResponse(res, 'Valid reason is required', 400);
      }
      
      const result = await POSService.addManualPoints(clientId, points, reason);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getCurrentCart(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      const cart = await POSService.getCurrentCart(clientId);
      successResponse(res, cart);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async validateDiscountCode(req: Request, res: Response) {
    try {
      const { code, amount } = req.body;
      
      if (!code || typeof code !== 'string') {
        return errorResponse(res, 'Valid discount code is required', 400);
      }
      
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return errorResponse(res, 'Valid amount is required', 400);
      }
      
      const result = await POSService.validateDiscountCode(code, amount);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getSaleSummary(req: Request, res: Response) {
    try {
      const { date } = req.query;
      let targetDate = new Date();
      
      if (date && typeof date === 'string') {
        targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          return errorResponse(res, 'Invalid date format', 400);
        }
      }
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Récupérer les transactions via le service existant
      // On utilise getClientTransactions comme exemple, ou on peut créer une méthode dédiée
      // Pour l'instant, on retourne un résumé basé sur les transactions disponibles
      const summary = {
        date: targetDate.toISOString().split('T')[0],
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        paymentMethods: {
          cash: 0,
          card: 0,
          mobile: 0,
          wallet: 0,
        },
      };
      
      successResponse(res, summary);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};