import type { Request, Response } from 'express';
import { RewardService } from '../services/reward.service';
import { successResponse, errorResponse } from '../utils/response';

export const RewardController = {
  async getAll(req: Request, res: Response) {
    try {
      const rewards = await RewardService.getAllRewards();
      successResponse(res, rewards);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid reward ID is required', 400);
      }
      
      const reward = await RewardService.getRewardById(id);
      if (!reward) return errorResponse(res, 'Reward not found', 404);
      successResponse(res, reward);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const rewardData = req.body;
      
      // Validation des données
      if (!rewardData.name) {
        return errorResponse(res, 'Reward name is required', 400);
      }
      if (!rewardData.description) {
        return errorResponse(res, 'Reward description is required', 400);
      }
      if (!rewardData.pointsCost || rewardData.pointsCost <= 0) {
        return errorResponse(res, 'Valid points cost is required', 400);
      }
      if (!rewardData.type) {
        return errorResponse(res, 'Reward type is required', 400);
      }
      if (!rewardData.value) {
        return errorResponse(res, 'Reward value is required', 400);
      }
      
      const validTypes = ['discount', 'free_item', 'special', 'percentage'];
      if (!validTypes.includes(rewardData.type)) {
        return errorResponse(res, `Invalid reward type. Must be one of: ${validTypes.join(', ')}`, 400);
      }
      
      const reward = await RewardService.createReward(rewardData);
      successResponse(res, reward, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid reward ID is required', 400);
      }
      
      // Validation optionnelle des données
      if (updates.pointsCost !== undefined && updates.pointsCost <= 0) {
        return errorResponse(res, 'Points cost must be greater than 0', 400);
      }
      
      if (updates.type !== undefined) {
        const validTypes = ['discount', 'free_item', 'special', 'percentage'];
        if (!validTypes.includes(updates.type)) {
          return errorResponse(res, `Invalid reward type. Must be one of: ${validTypes.join(', ')}`, 400);
        }
      }
      
      const reward = await RewardService.updateReward(id, updates);
      if (!reward) {
        return errorResponse(res, 'Reward not found', 404);
      }
      
      successResponse(res, reward);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid reward ID is required', 400);
      }
      
      await RewardService.deleteReward(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const allRewards = await RewardService.getAllRewards();
      const activeRewards = allRewards.filter(reward => reward.isActive === true);
      successResponse(res, activeRewards);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      if (!type || typeof type !== 'string') {
        return errorResponse(res, 'Valid reward type is required', 400);
      }
      
      const validTypes = ['discount', 'free_item', 'special', 'percentage'];
      if (!validTypes.includes(type)) {
        return errorResponse(res, `Invalid reward type. Must be one of: ${validTypes.join(', ')}`, 400);
      }
      
      const allRewards = await RewardService.getAllRewards();
      const filteredRewards = allRewards.filter(reward => reward.type === type);
      successResponse(res, filteredRewards);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByMinTier(req: Request, res: Response) {
    try {
      const { tier } = req.params;
      
      if (!tier || typeof tier !== 'string') {
        return errorResponse(res, 'Valid tier is required', 400);
      }
      
      const validTiers = ['bronze', 'silver', 'gold', 'diamond'];
      if (!validTiers.includes(tier)) {
        return errorResponse(res, `Invalid tier. Must be one of: ${validTiers.join(', ')}`, 400);
      }
      
      const allRewards = await RewardService.getAllRewards();
      const tierOrder = { bronze: 0, silver: 1, gold: 2, diamond: 3 };
      const currentTierLevel = tierOrder[tier as keyof typeof tierOrder];
      
      const filteredRewards = allRewards.filter(reward => {
        if (!reward.minTier) return true;
        const rewardTierLevel = tierOrder[reward.minTier as keyof typeof tierOrder];
        return rewardTierLevel <= currentTierLevel;
      });
      
      successResponse(res, filteredRewards);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const allRewards = await RewardService.getAllRewards();
      
      const totalRewards = allRewards.length;
      const activeRewards = allRewards.filter(r => r.isActive).length;
      const inactiveRewards = totalRewards - activeRewards;
      
      const rewardsByType = {
        discount: allRewards.filter(r => r.type === 'discount').length,
        free_item: allRewards.filter(r => r.type === 'free_item').length,
        special: allRewards.filter(r => r.type === 'special').length,
        percentage: allRewards.filter(r => r.type === 'percentage').length,
      };
      
      const averagePointsCost = totalRewards > 0 
        ? allRewards.reduce((sum, r) => sum + r.pointsCost, 0) / totalRewards 
        : 0;
      
      const stats = {
        totalRewards,
        activeRewards,
        inactiveRewards,
        rewardsByType,
        averagePointsCost,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};