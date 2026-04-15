// backend/src/services/mission.service.ts
import { Mission } from '../models/Mission.model';
import { ClientMission } from '../models/ClientMission.model';
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';

export const MissionService = {
  async getAllMissions() {
    return await Mission.find().sort({ createdAt: -1 });
  },

  async createMission(data: any) {
    console.log("📝 MissionService.createMission received:", data);
    
    // Vérifier les champs requis
    if (!data.name) {
      throw new Error('Mission name is required');
    }
    if (!data.description) {
      throw new Error('Mission description is required');
    }
    if (!data.type) {
      throw new Error('Mission type is required');
    }
    
    // pointsReward peut venir sous forme de "pointsReward" ou "reward"
    let pointsReward = data.pointsReward;
    if (pointsReward === undefined || pointsReward === null) {
      // Si le frontend a envoyé "reward" au lieu de "pointsReward"
      pointsReward = data.reward;
    }
    
    if (pointsReward === undefined || pointsReward === null || pointsReward <= 0) {
      console.error("❌ Invalid pointsReward:", { pointsReward, reward: data.reward });
      throw new Error('Valid reward is required (pointsReward > 0)');
    }
    
    // target
    let target = data.target;
    if (target === undefined || target === null || target <= 0) {
      target = 1;
    }
    
    // validFrom / validUntil
    let validFrom = data.validFrom;
    if (!validFrom) {
      validFrom = new Date();
    }
    
    let validUntil = data.validUntil;
    if (!validUntil) {
      validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
    }
    
    const mission = new Mission({
      name: data.name,
      description: data.description,
      type: data.type,
      target: target,
      pointsReward: pointsReward,  // ← pointsReward
      bonusReward: data.bonusReward,
      validFrom: validFrom,
      validUntil: validUntil,
      isActive: data.isActive !== undefined ? data.isActive : true,
      icon: data.icon || "star",
      maxCompletions: data.maxCompletions,
    });
    
    await mission.save();
    console.log("✅ Mission created:", mission._id);
    return mission;
  },

  async updateMission(id: string, updates: any) {
    console.log("📝 MissionService.updateMission:", { id, updates });
    
    // Conversion si nécessaire
    if (updates.reward !== undefined && updates.pointsReward === undefined) {
      updates.pointsReward = updates.reward;
      delete updates.reward;
    }
    
    const mission = await Mission.findByIdAndUpdate(
      id, 
      updates, 
      { returnDocument: 'after' }  // ← au lieu de { new: true }
    );
    
    if (!mission) {
      throw new Error('Mission not found');
    }
    
    return mission;
  },

  async deleteMission(id: string) {
    const result = await Mission.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Mission not found');
    }
    return true;
  },

  async getMyMissions(clientId: string) {
    return await ClientMission.find({ clientId }).populate('missionId');
  },

  async updateMissionProgress(clientId: string, missionId: string, progress: number) {
    let clientMission = await ClientMission.findOne({ clientId, missionId });
    const mission = await Mission.findById(missionId);
    if (!mission) throw new Error('Mission not found');
    
    if (!clientMission) {
      clientMission = new ClientMission({ clientId, missionId, progress: 0 });
    }
    
    clientMission.progress = progress;
    
    if (progress >= mission.target && clientMission.status === 'active') {
      clientMission.status = 'completed';
      clientMission.completedAt = new Date();
      
      const client = await Client.findById(clientId);
      if (client) {
        client.loyaltyPoints += mission.pointsReward;  // ← pointsReward (pas reward)
        await client.save();
        
        const transaction = new LoyaltyTransaction({
          clientId: client.id,
          type: 'mission',
          points: mission.pointsReward,
          description: `Mission complétée: ${mission.name}`,
        });
        await transaction.save();
      }
    }
    
    await clientMission.save();
    return clientMission;
  },
};