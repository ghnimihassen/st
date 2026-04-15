// backend/src/services/client.service.ts
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';
import { Referral } from '../models/Referral.model';
import { Reward } from '../models/Reward.model';
import { Types } from 'mongoose';

export const ClientService = {
  async getAllClients() {
    return await Client.find().sort({ createdAt: -1 });
  },

  async getClientById(id: string) {
    let client = null;
    if (Types.ObjectId.isValid(id)) {
      client = await Client.findById(id);
    }
    if (!client) {
      client = await Client.findOne({ email: id });
    }
    if (!client) {
      client = await Client.findOne({ qrCode: id });
    }
    return client;
  },

  async createClient(data: any) {
    const qrCode = data.qrCode || `QR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const referralCode = data.referralCode || `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const client = new Client({
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      qrCode,
      referralCode,
      loyaltyPoints: data.loyaltyPoints || 0,
      lifetimePoints: data.lifetimePoints || 0,
      tier: data.tier || 'bronze',
      totalSpent: data.totalSpent || 0,
      totalOrders: data.totalOrders || 0,
      walletBalance: data.walletBalance || 0,
      referralCount: data.referralCount || 0,
      referredBy: data.referredBy,
      isActive: data.isActive !== undefined ? data.isActive : true,
      lastVisit: data.lastVisit,
    });
    await client.save();
    return client;
  },

  async updateClient(id: string, updates: any) {
    let client = null;
    if (Types.ObjectId.isValid(id)) {
      client = await Client.findById(id);
    }
    if (!client) {
      client = await Client.findOne({ email: id });
    }
    if (!client) {
      throw new Error('Client not found');
    }
    
    const allowedUpdates = ['name', 'email', 'phone', 'birthDate', 'gender', 'qrCode', 
      'referralCode', 'loyaltyPoints', 'lifetimePoints', 'tier', 'totalSpent', 
      'totalOrders', 'walletBalance', 'referralCount', 'referredBy', 'isActive', 'lastVisit'];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        (client as any)[key] = updates[key];
      }
    }
    
    if (updates.lifetimePoints !== undefined || updates.loyaltyPoints !== undefined) {
      const lifetimePoints = (client as any).lifetimePoints || 0;
      if (lifetimePoints >= 3000) (client as any).tier = 'diamond';
      else if (lifetimePoints >= 1500) (client as any).tier = 'gold';
      else if (lifetimePoints >= 500) (client as any).tier = 'silver';
      else (client as any).tier = 'bronze';
    }
    
    (client as any).updatedAt = new Date();
    await client.save();
    return client;
  },

  async deleteClient(id: string) {
    let client = null;
    if (Types.ObjectId.isValid(id)) {
      client = await Client.findById(id);
    }
    if (!client) {
      client = await Client.findOne({ email: id });
    }
    if (!client) {
      throw new Error('Client not found');
    }
    
    const clientId = client._id;
    await LoyaltyTransaction.deleteMany({ clientId: clientId });
    await Referral.deleteMany({ referrerId: clientId });
    await Referral.deleteMany({ referredId: clientId });
    await Client.findByIdAndDelete(clientId);
    return true;
  },

  async addPoints(clientId: string, points: number, reason: string) {
    let client = null;
    if (Types.ObjectId.isValid(clientId)) {
      client = await Client.findById(clientId);
    }
    if (!client) {
      client = await Client.findOne({ email: clientId });
    }
    if (!client) {
      throw new Error('Client not found');
    }

    const oldPoints = (client as any).loyaltyPoints || 0;
    const newPoints = oldPoints + points;
    (client as any).loyaltyPoints = Math.max(0, newPoints);
    
    if (points > 0) {
      (client as any).lifetimePoints = ((client as any).lifetimePoints || 0) + points;
    }
    
    const lifetimePoints = (client as any).lifetimePoints || 0;
    if (lifetimePoints >= 3000) (client as any).tier = 'diamond';
    else if (lifetimePoints >= 1500) (client as any).tier = 'gold';
    else if (lifetimePoints >= 500) (client as any).tier = 'silver';
    else (client as any).tier = 'bronze';
    
    await client.save();

    const transaction = new LoyaltyTransaction({
      clientId: client._id,
      type: points > 0 ? 'earn' : 'redeem',
      points: Math.abs(points),
      description: reason,
    });
    await transaction.save();

    return client;
  },

  async getClientStats(clientId: string) {
    let client = null;
    if (Types.ObjectId.isValid(clientId)) {
      client = await Client.findById(clientId);
    }
    if (!client) {
      client = await Client.findOne({ email: clientId });
    }
    if (!client) {
      throw new Error('Client not found');
    }

    const transactions = await LoyaltyTransaction.find({ clientId: client._id })
      .sort({ createdAt: -1 })
      .limit(20);
      
    const referrals = await Referral.find({ referrerId: client._id });
    
    const pointsToNextTier = (() => {
      const lifetimePoints = (client as any).lifetimePoints || 0;
      if (lifetimePoints < 500) return 500 - lifetimePoints;
      if (lifetimePoints < 1500) return 1500 - lifetimePoints;
      if (lifetimePoints < 3000) return 3000 - lifetimePoints;
      return 0;
    })();

    return {
      client,
      transactions,
      referrals,
      pointsToNextTier: Math.max(0, pointsToNextTier),
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'rewarded').length,
    };
  },

  async getGlobalStats() {
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ isActive: true });
    
    const totalPointsIssuedResult = await LoyaltyTransaction.aggregate([
      { $match: { points: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    const totalPointsIssued = totalPointsIssuedResult[0]?.total || 0;
    
    const totalPointsRedeemedResult = await LoyaltyTransaction.aggregate([
      { $match: { points: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$points', -1] } } } }
    ]);
    const totalPointsRedeemed = totalPointsRedeemedResult[0]?.total || 0;
    
    const totalRewardsRedeemed = await LoyaltyTransaction.countDocuments({ type: 'redeem' });
    
    const clientsByTier = {
      bronze: await Client.countDocuments({ tier: 'bronze' }),
      silver: await Client.countDocuments({ tier: 'silver' }),
      gold: await Client.countDocuments({ tier: 'gold' }),
      diamond: await Client.countDocuments({ tier: 'diamond' }),
    };
    
    const totalSpent = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } }
    ]);
    
    const pointsInCirculation = totalPointsIssued - totalPointsRedeemed;

    return {
      totalClients,
      activeClients,
      totalPointsIssued,
      totalPointsRedeemed,
      pointsInCirculation,
      totalRewardsRedeemed,
      clientsByTier,
      totalRevenue: totalSpent[0]?.total || 0,
    };
  },

  async getClientByEmail(email: string) {
    return await Client.findOne({ email });
  },

  async getClientByQRCode(qrCode: string) {
    return await Client.findOne({ qrCode });
  },

  async getClientByReferralCode(referralCode: string) {
    return await Client.findOne({ referralCode });
  },

  // ✅ Échange de récompense (corrigé pour gérer stock = null)
  async redeemReward(clientId: string, rewardId: string) {
    let client = null;
    if (Types.ObjectId.isValid(clientId)) {
      client = await Client.findById(clientId);
    }
    if (!client) {
      client = await Client.findOne({ email: clientId });
    }
    if (!client) {
      throw new Error('Client not found');
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }
    if (!reward.isActive) {
      throw new Error('Reward is no longer available');
    }
    // Vérifier le stock uniquement si défini (non null)
    if (reward.stock != null && reward.stock <= 0) {
      throw new Error('Reward out of stock');
    }
    if (client.loyaltyPoints < reward.pointsCost) {
      throw new Error('Insufficient points');
    }

    // Déduire les points
    client.loyaltyPoints -= reward.pointsCost;
    await client.save();

    // Mettre à jour le stock si défini
    if (reward.stock != null) {
      reward.stock -= 1;
      await reward.save();
    }
    reward.usageCount = (reward.usageCount || 0) + 1;
    await reward.save();

    const transaction = new LoyaltyTransaction({
      clientId: client._id,
      type: 'redeem',
      points: -reward.pointsCost,
      description: `Échange récompense: ${reward.name}`,
    });
    await transaction.save();

    return { client, transaction };
  },
};