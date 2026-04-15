import type { Request, Response } from 'express';
import { ShareService } from '../services/share.service';
import { successResponse, errorResponse } from '../utils/response';

export const ShareController = {
  async getAll(req: Request, res: Response) {
    try {
      const links = await ShareService.getAllShareLinks();
      successResponse(res, links);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid share link ID is required', 400);
      }
      
      const link = await ShareService.getShareLinkById(id);
      successResponse(res, link);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { clientId, productId, productName, platform } = req.body;
      
      // Validation des données
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      if (!productId || typeof productId !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      if (!productName || typeof productName !== 'string') {
        return errorResponse(res, 'Product name is required', 400);
      }
      if (!platform || typeof platform !== 'string') {
        return errorResponse(res, 'Platform is required', 400);
      }
      
      const validPlatforms = ['facebook', 'twitter', 'whatsapp', 'instagram', 'email'];
      if (!validPlatforms.includes(platform.toLowerCase())) {
        return errorResponse(res, `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`, 400);
      }
      
      const link = await ShareService.createShareLink(clientId, productId, productName, platform);
      successResponse(res, link, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async validate(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      if (!code || typeof code !== 'string') {
        return errorResponse(res, 'Valid share code is required', 400);
      }
      
      const link = await ShareService.validateShareLink(code);
      successResponse(res, { valid: true, productName: link.productName });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getInfo(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      if (!code || typeof code !== 'string') {
        return errorResponse(res, 'Valid share code is required', 400);
      }
      
      const info = await ShareService.getShareLinkInfo(code);
      successResponse(res, info);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getMyLinks(req: Request, res: Response) {
    try {
      const clientId = (req as any).user?.id;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Client ID not found', 401);
      }
      
      const links = await ShareService.getMyShareLinks(clientId);
      successResponse(res, links);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await ShareService.getShareStats();
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      if (!productId || typeof productId !== 'string') {
        return errorResponse(res, 'Valid product ID is required', 400);
      }
      
      const result = await ShareService.getShareLinksByProduct(productId);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      
      if (!platform || typeof platform !== 'string') {
        return errorResponse(res, 'Valid platform is required', 400);
      }
      
      const result = await ShareService.getShareLinksByPlatform(platform);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async deleteExpired(req: Request, res: Response) {
    try {
      const result = await ShareService.deleteExpiredLinks();
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid share link ID is required', 400);
      }
      
      const result = await ShareService.deleteShareLink(id);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      if (!code || typeof code !== 'string') {
        return errorResponse(res, 'Valid share code is required', 400);
      }
      
      const link = await ShareService.getShareLinkByCode(code);
      successResponse(res, link);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid share link ID is required', 400);
      }
      
      const link = await ShareService.updateShareLink(id, updates);
      successResponse(res, link);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};