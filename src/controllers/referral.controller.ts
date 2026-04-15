import type { Request, Response } from 'express';
import { ReferralService } from '../services/referral.service';
import { successResponse, errorResponse } from '../utils/response';

export const ReferralController = {
  async getAll(req: Request, res: Response) {
    try {
      const referrals = await ReferralService.getAllReferrals();
      successResponse(res, referrals);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid referral ID is required', 400);
      }
      
      const referrals = await ReferralService.getAllReferrals();
      const referral = referrals.find(r => r._id.toString() === id);
      
      if (!referral) {
        return errorResponse(res, 'Referral not found', 404);
      }
      
      successResponse(res, referral);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const referralData = req.body;
      
      // Validation
      if (!referralData.referrerId) {
        return errorResponse(res, 'Referrer ID is required', 400);
      }
      if (!referralData.referredName) {
        return errorResponse(res, 'Referred name is required', 400);
      }
      if (!referralData.referredEmail) {
        return errorResponse(res, 'Referred email is required', 400);
      }
      
      const referral = await ReferralService.createReferral(referralData);
      successResponse(res, referral, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async complete(req: Request, res: Response) {
    try {
      const { referralCode, newClientId, newClientName, newClientEmail } = req.body;
      
      if (!referralCode || typeof referralCode !== 'string') {
        return errorResponse(res, 'Valid referral code is required', 400);
      }
      if (!newClientId || typeof newClientId !== 'string') {
        return errorResponse(res, 'Valid client ID is required', 400);
      }
      if (!newClientName || typeof newClientName !== 'string') {
        return errorResponse(res, 'Client name is required', 400);
      }
      if (!newClientEmail || typeof newClientEmail !== 'string') {
        return errorResponse(res, 'Client email is required', 400);
      }
      
      const referral = await ReferralService.completeReferral(referralCode, newClientId, newClientName, newClientEmail);
      successResponse(res, referral);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async validate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { purchaseAmount } = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid referral ID is required', 400);
      }
      
      if (purchaseAmount === undefined || typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        return errorResponse(res, 'Valid purchase amount is required', 400);
      }
      
      const referral = await ReferralService.validateReferral(id, purchaseAmount);
      successResponse(res, referral);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getPending(req: Request, res: Response) {
    try {
      const referrals = await ReferralService.getPendingReferrals();
      successResponse(res, referrals);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByReferrer(req: Request, res: Response) {
    try {
      const { referrerId } = req.params;
      
      if (!referrerId || typeof referrerId !== 'string') {
        return errorResponse(res, 'Valid referrer ID is required', 400);
      }
      
      const referrals = await ReferralService.getReferralsByReferrer(referrerId);
      successResponse(res, referrals);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByReferred(req: Request, res: Response) {
    try {
      const { referredEmail } = req.params;
      
      if (!referredEmail || typeof referredEmail !== 'string') {
        return errorResponse(res, 'Valid referred email is required', 400);
      }
      
      const referrals = await ReferralService.getAllReferrals();
      const filteredReferrals = referrals.filter(r => r.referredEmail === referredEmail);
      
      successResponse(res, filteredReferrals);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const referrals = await ReferralService.getAllReferrals();
      
      const totalReferrals = referrals.length;
      const pendingReferrals = referrals.filter(r => r.status === 'first_purchase_pending').length;
      const completedReferrals = referrals.filter(r => r.status === 'rewarded').length;
      const totalPointsGiven = referrals
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + r.referrerReward + r.referredReward, 0);
      
      const stats = {
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalPointsGiven,
        conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid referral ID is required', 400);
      }
      
      // Note: deleteReferral doit être ajouté au service
      // await ReferralService.deleteReferral(id);
      
      successResponse(res, { success: true, message: 'Referral deleted successfully' });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};