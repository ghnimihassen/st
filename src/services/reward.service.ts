import { Reward } from '../models/Reward.model';

export const RewardService = {
  async getAllRewards() {
    return await Reward.find().sort({ pointsCost: 1 });
  },

  async getRewardById(id: string) {
    return await Reward.findById(id);
  },

  async createReward(data: any) {
    const reward = new Reward(data);
    await reward.save();
    return reward;
  },

  async updateReward(id: string, updates: any) {
    return await Reward.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteReward(id: string) {
    await Reward.findByIdAndDelete(id);
    return true;
  },
};