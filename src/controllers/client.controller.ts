import type { Request, Response } from 'express';
import { ClientService } from '../services/client.service';
import { successResponse, errorResponse } from '../utils/response';

export const ClientController = {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientService.getAllClients();
      successResponse(res, clients);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      const client = await ClientService.getClientById(id);
      if (!client) return errorResponse(res, 'Client not found', 404);
      successResponse(res, client);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const clientData = req.body;
      
      if (!clientData.name) {
        return errorResponse(res, 'Client name is required', 400);
      }
      if (!clientData.email) {
        return errorResponse(res, 'Client email is required', 400);
      }
      
      const client = await ClientService.createClient(clientData);
      successResponse(res, client, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      const client = await ClientService.updateClient(id, req.body);
      if (!client) {
        return errorResponse(res, 'Client not found', 404);
      }
      successResponse(res, client);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      await ClientService.deleteClient(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async addPoints(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { points, reason } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      if (points === undefined || typeof points !== 'number') {
        return errorResponse(res, 'Valid points amount is required', 400);
      }
      
      if (!reason || typeof reason !== 'string') {
        return errorResponse(res, 'Valid reason is required', 400);
      }
      
      const client = await ClientService.addPoints(id, points, reason);
      if (!client) {
        return errorResponse(res, 'Client not found', 404);
      }
      successResponse(res, client);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      
      const stats = await ClientService.getClientStats(id);
      if (!stats) {
        return errorResponse(res, 'Client not found', 404);
      }
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getGlobalStats(req: Request, res: Response) {
    try {
      const stats = await ClientService.getGlobalStats();
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ✅ Nouvelle méthode pour échanger une récompense
  async redeemReward(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rewardId } = req.body;

      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      if (!rewardId || typeof rewardId !== 'string') {
        return errorResponse(res, 'Valid reward ID is required', 400);
      }

      const result = await ClientService.redeemReward(id, rewardId);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};