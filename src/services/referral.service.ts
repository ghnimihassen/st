import { Referral } from '../models/Referral.model';
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';

export const ReferralService = {
  async getAllReferrals() {
    return await Referral.find().populate('referrerId').sort({ createdAt: -1 });
  },

  async createReferral(data: any) {
    const referral = new Referral(data);
    await referral.save();
    return referral;
  },

  async completeReferral(referralCode: string, newClientId: string, newClientName: string, newClientEmail: string) {
    const referrer = await Client.findOne({ referralCode });
    if (!referrer) throw new Error('Referral code not found');
    
    const referral = new Referral({
      referrerId: referrer.id,
      referredId: newClientId,
      referredName: newClientName,
      referredEmail: newClientEmail,
      status: 'first_purchase_pending',
      referrerReward: 100,
      referredReward: 50,
    });
    await referral.save();
    
    const newClient = await Client.findById(newClientId);
    if (newClient) {
      newClient.loyaltyPoints += 50;
      await newClient.save();
    }
    
    return referral;
  },

  async validateReferral(referralId: string, purchaseAmount: number) {
    const referral = await Referral.findById(referralId);
    if (!referral) throw new Error('Referral not found');
    if (referral.status !== 'first_purchase_pending') throw new Error('Referral already validated');
    
    referral.status = 'rewarded';
    referral.firstPurchaseAmount = purchaseAmount;
    referral.firstPurchaseDate = new Date();
    referral.completedAt = new Date();
    await referral.save();
    
    const referrer = await Client.findById(referral.referrerId);
    if (referrer) {
      referrer.loyaltyPoints += referral.referrerReward;
      referrer.referralCount += 1;
      await referrer.save();
      
      const transaction = new LoyaltyTransaction({
        clientId: referrer.id,
        type: 'referral',
        points: referral.referrerReward,
        description: `Parrainage de ${referral.referredName}`,
      });
      await transaction.save();
    }
    
    return referral;
  },

  async getPendingReferrals() {
    return await Referral.find({ status: 'first_purchase_pending' }).populate('referrerId');
  },

  async getReferralsByReferrer(referrerId: string) {
    return await Referral.find({ referrerId });
  },
};