import { SpecialDay } from '../models/SpecialDay.model';

export const SpecialDayService = {
  async getAllSpecialDays() {
    return await SpecialDay.find().sort({ createdAt: -1 });
  },

  async createSpecialDay(data: any) {
    const day = new SpecialDay(data);
    await day.save();
    return day;
  },

  async updateSpecialDay(id: string, updates: any) {
    return await SpecialDay.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteSpecialDay(id: string) {
    await SpecialDay.findByIdAndDelete(id);
    return true;
  },

  async getTodayMultiplier(gender?: string) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const today = now.toISOString().split('T')[0];
    
    const activeDay = await SpecialDay.findOne({
      isActive: true,
      $or: [{ dayOfWeek }, { specificDate: today }]
    });
    
    let multiplier = 1;
    let bonusPoints = 0;
    let day = null;
    
    if (activeDay) {
      if (!activeDay.targetGender || activeDay.targetGender === gender || activeDay.targetGender === 'all') {
        multiplier = activeDay.multiplier;
        bonusPoints = activeDay.bonusPoints || 0;
        day = activeDay;
      }
    }
    
    return { multiplier, bonusPoints, day };
  },
};