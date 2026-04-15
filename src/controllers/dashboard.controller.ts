import type { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse, errorResponse } from '../utils/response';

export const DashboardController = {
  async getOverview(req: Request, res: Response) {
    try {
      const data = await DashboardService.getOverview();
      successResponse(res, data);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getSalesByDay(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await DashboardService.getSalesByDay(days);
      successResponse(res, data);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getTopItems(req: Request, res: Response) {
    try {
      const data = await DashboardService.getTopItems();
      successResponse(res, data);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getTierDistribution(req: Request, res: Response) {
    try {
      const data = await DashboardService.getTierDistribution();
      successResponse(res, data);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getLoyaltyActivity(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await DashboardService.getLoyaltyActivity(days);
      successResponse(res, data);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};