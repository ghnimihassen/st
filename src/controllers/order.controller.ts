import type { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { successResponse, errorResponse } from '../utils/response';

export const OrderController = {
  async getAll(req: Request, res: Response) {
    try {
      // Récupération sécurisée des paramètres de requête
      let startDate: string | undefined;
      let endDate: string | undefined;
      let customerId: string | undefined;
      
      if (req.query.startDate && typeof req.query.startDate === 'string') {
        startDate = req.query.startDate;
      }
      if (req.query.endDate && typeof req.query.endDate === 'string') {
        endDate = req.query.endDate;
      }
      if (req.query.customerId && typeof req.query.customerId === 'string') {
        customerId = req.query.customerId;
      }
      
      const orders = await OrderService.getAllOrders({ startDate, endDate, customerId });
      successResponse(res, orders);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const order = await OrderService.getOrderById(id);
      if (!order) return errorResponse(res, 'Order not found', 404);
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const orderData = req.body;
      
      // Validation des données de commande
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return errorResponse(res, 'At least one item is required', 400);
      }
      if (!orderData.paymentMethod) {
        return errorResponse(res, 'Payment method is required', 400);
      }
      if (orderData.total === undefined || orderData.total < 0) {
        return errorResponse(res, 'Valid total amount is required', 400);
      }
      
      const order = await OrderService.createOrder(orderData);
      successResponse(res, order, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      if (!status || typeof status !== 'string') {
        return errorResponse(res, 'Valid status is required', 400);
      }
      
      const validStatuses = ['pending', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
      
      const order = await OrderService.updateOrderStatus(id, status);
      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }
      
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await OrderService.getOrderStats();
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByCustomer(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      
      if (!customerId || typeof customerId !== 'string') {
        return errorResponse(res, 'Valid customer ID is required', 400);
      }
      
      const limit = req.query.limit && typeof req.query.limit === 'string' 
        ? parseInt(req.query.limit, 10) 
        : 50;
      
      const orders = await OrderService.getCustomerOrders(customerId, limit);
      successResponse(res, orders);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid order ID is required', 400);
      }
      
      const order = await OrderService.cancelOrder(id);
      successResponse(res, order);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStatsByDateRange(req: Request, res: Response) {
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate && typeof req.query.startDate === 'string') {
        startDate = new Date(req.query.startDate);
        if (isNaN(startDate.getTime())) {
          return errorResponse(res, 'Invalid start date', 400);
        }
      }
      
      if (req.query.endDate && typeof req.query.endDate === 'string') {
        endDate = new Date(req.query.endDate);
        if (isNaN(endDate.getTime())) {
          return errorResponse(res, 'Invalid end date', 400);
        }
      }
      
      if (!startDate && !endDate) {
        return errorResponse(res, 'At least one date range parameter is required', 400);
      }
      
      if (startDate && endDate && startDate > endDate) {
        return errorResponse(res, 'Start date must be before end date', 400);
      }
      
      const defaultStart = startDate || new Date(0);
      const defaultEnd = endDate || new Date();
      
      const stats = await OrderService.getOrderStatsByDateRange(defaultStart, defaultEnd);
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getRecent(req: Request, res: Response) {
    try {
      const limit = req.query.limit && typeof req.query.limit === 'string'
        ? parseInt(req.query.limit, 10)
        : 10;
      
      const orders = await OrderService.getAllOrders({});
      const recentOrders = orders.slice(0, limit);
      
      successResponse(res, recentOrders);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};