import type { Request, Response } from 'express';
import { MissionService } from '../services/mission.service';
import { successResponse, errorResponse } from '../utils/response';

export const MissionController = {
  async getAll(req: Request, res: Response) {
    try {
      const missions = await MissionService.getAllMissions();
      successResponse(res, missions);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      // Récupérer toutes les missions et filtrer par ID
      const missions = await MissionService.getAllMissions();
      const mission = missions.find(m => m._id.toString() === id);
      
      if (!mission) {
        return errorResponse(res, 'Mission not found', 404);
      }
      
      successResponse(res, mission);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const missionData = req.body;
      
      // Validation des données
      if (!missionData.name) {
        return errorResponse(res, 'Mission name is required', 400);
      }
      if (!missionData.description) {
        return errorResponse(res, 'Mission description is required', 400);
      }
      if (!missionData.type) {
        return errorResponse(res, 'Mission type is required', 400);
      }
      if (!missionData.target || missionData.target <= 0) {
        return errorResponse(res, 'Valid target is required', 400);
      }
      if (!missionData.reward || missionData.reward <= 0) {
        return errorResponse(res, 'Valid reward is required', 400);
      }
      if (!missionData.validFrom) {
        return errorResponse(res, 'Valid from date is required', 400);
      }
      if (!missionData.validUntil) {
        return errorResponse(res, 'Valid until date is required', 400);
      }
      
      const mission = await MissionService.createMission(missionData);
      successResponse(res, mission, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      const mission = await MissionService.updateMission(id, updates);
      if (!mission) {
        return errorResponse(res, 'Mission not found', 404);
      }
      
      successResponse(res, mission);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      await MissionService.deleteMission(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getMyProgress(req: Request, res: Response) {
    try {
      const clientId = (req as any).user?.id;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Client ID not found', 401);
      }
      
      const missions = await MissionService.getMyMissions(clientId);
      successResponse(res, missions);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async updateProgress(req: Request, res: Response) {
    try {
      const { missionId, progress } = req.body;
      const clientId = (req as any).user?.id;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Client ID not found', 401);
      }
      
      if (!missionId || typeof missionId !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      if (progress === undefined || typeof progress !== 'number' || progress < 0) {
        return errorResponse(res, 'Valid progress number is required', 400);
      }
      
      const result = await MissionService.updateMissionProgress(clientId, missionId, progress);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getActiveMissions(req: Request, res: Response) {
    try {
      const missions = await MissionService.getAllMissions();
      const now = new Date();
      const activeMissions = missions.filter(mission => 
        mission.isActive && 
        new Date(mission.validFrom) <= now && 
        new Date(mission.validUntil) >= now
      );
      successResponse(res, activeMissions);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getMissionsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      if (!type || typeof type !== 'string') {
        return errorResponse(res, 'Valid mission type is required', 400);
      }
      
      const missions = await MissionService.getAllMissions();
      const filteredMissions = missions.filter(mission => mission.type === type);
      successResponse(res, filteredMissions);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getMissionStats(req: Request, res: Response) {
    try {
      const missions = await MissionService.getAllMissions();
      const clientMissions = await MissionService.getMyMissions('all');
      
      const totalMissions = missions.length;
      const activeMissions = missions.filter(m => m.isActive).length;
      const completedMissions = clientMissions.filter(cm => cm.status === 'completed').length;
      const inProgressMissions = clientMissions.filter(cm => cm.status === 'active').length;
      
      const stats = {
        totalMissions,
        activeMissions,
        completedMissions,
        inProgressMissions,
        completionRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getClientMission(req: Request, res: Response) {
    try {
      const { missionId } = req.params;
      const clientId = (req as any).user?.id;
      
      if (!clientId || typeof clientId !== 'string') {
        return errorResponse(res, 'Client ID not found', 401);
      }
      
      if (!missionId || typeof missionId !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      const clientMissions = await MissionService.getMyMissions(clientId);
      const clientMission = clientMissions.find(cm => cm.missionId.toString() === missionId);
      
      successResponse(res, clientMission || { status: 'not_started', progress: 0 });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async resetMission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid mission ID is required', 400);
      }
      
      const mission = await MissionService.updateMission(id, {
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      
      successResponse(res, { success: true, mission });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};