import type { Request, Response } from 'express';
import { GameService } from '../services/game.service';
import { successResponse, errorResponse } from '../utils/response';

export const GameController = {
  async getAll(req: Request, res: Response) {
    try {
      const games = await GameService.getAllGames();
      successResponse(res, games);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const game = await GameService.createGame(req.body);
      successResponse(res, game, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid game ID is required', 400);
      }
      const game = await GameService.updateGame(id, req.body);
      successResponse(res, game);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid game ID is required', 400);
      }
      await GameService.deleteGame(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async canPlay(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const gameType = req.params.gameType;
      
      if (!gameType || typeof gameType !== 'string') {
        return errorResponse(res, 'Valid game type is required', 400);
      }
      
      if (user?.role !== 'client') {
        return successResponse(res, { canPlay: false, reason: 'Seuls les clients peuvent jouer' });
      }
      
      const result = await GameService.canPlayGame(user.id, gameType);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async play(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const gameType = req.params.gameType;
      
      if (!gameType || typeof gameType !== 'string') {
        return errorResponse(res, 'Valid game type is required', 400);
      }
      
      if (user?.role !== 'client') {
        return errorResponse(res, 'Seuls les clients peuvent jouer', 403);
      }
      
      const result = await GameService.playGame(user.id, gameType);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const clientId = (req as any).user?.id;
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Client ID not found', 401);
      }
      
      const limit = req.query.limit && typeof req.query.limit === 'string' 
        ? parseInt(req.query.limit, 10) 
        : 20;
      
      const history = await GameService.getGameHistory(clientId, limit);
      successResponse(res, history);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ✅ Nouvelle méthode: mise à jour par type (utilisée par le frontend)
  async updateByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const updates = req.body;
      
      if (!type || typeof type !== 'string') {
        return errorResponse(res, 'Valid game type is required', 400);
      }
      
      const game = await GameService.updateGameByType(type, updates);
      if (!game) {
        return errorResponse(res, 'Game not found', 404);
      }
      successResponse(res, game);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  // ✅ Nouvelle méthode: suppression par type (utilisée par le frontend)
  async deleteByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      if (!type || typeof type !== 'string') {
        return errorResponse(res, 'Valid game type is required', 400);
      }
      
      const deleted = await GameService.deleteGameByType(type);
      if (!deleted) {
        return errorResponse(res, 'Game not found', 404);
      }
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};