import type { Request, Response } from 'express';
import { SpecialDayService } from '../services/specialDay.service';
import { successResponse, errorResponse } from '../utils/response';

export const SpecialDayController = {
  async getAll(req: Request, res: Response) {
    try {
      const days = await SpecialDayService.getAllSpecialDays();
      successResponse(res, days);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid special day ID is required', 400);
      }
      
      const days = await SpecialDayService.getAllSpecialDays();
      const day = days.find(d => d._id.toString() === id);
      
      if (!day) {
        return errorResponse(res, 'Special day not found', 404);
      }
      
      successResponse(res, day);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const dayData = req.body;
      
      // Validation des données
      if (!dayData.name) {
        return errorResponse(res, 'Special day name is required', 400);
      }
      if (!dayData.description) {
        return errorResponse(res, 'Description is required', 400);
      }
      
      // Vérifier qu'au moins un des deux est présent (dayOfWeek ou specificDate)
      if (dayData.dayOfWeek === undefined && !dayData.specificDate) {
        return errorResponse(res, 'Either dayOfWeek or specificDate is required', 400);
      }
      
      // Validation du dayOfWeek
      if (dayData.dayOfWeek !== undefined) {
        if (typeof dayData.dayOfWeek !== 'number' || dayData.dayOfWeek < 0 || dayData.dayOfWeek > 6) {
          return errorResponse(res, 'dayOfWeek must be a number between 0 and 6', 400);
        }
      }
      
      // Validation du multiplicateur
      if (dayData.multiplier !== undefined && (typeof dayData.multiplier !== 'number' || dayData.multiplier < 1)) {
        return errorResponse(res, 'Multiplier must be a number greater than or equal to 1', 400);
      }
      
      // Validation du targetGender
      if (dayData.targetGender !== undefined) {
        const validGenders = ['male', 'female', 'all'];
        if (!validGenders.includes(dayData.targetGender)) {
          return errorResponse(res, `targetGender must be one of: ${validGenders.join(', ')}`, 400);
        }
      }
      
      const day = await SpecialDayService.createSpecialDay(dayData);
      successResponse(res, day, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid special day ID is required', 400);
      }
      
      // Validation optionnelle
      if (updates.dayOfWeek !== undefined) {
        if (typeof updates.dayOfWeek !== 'number' || updates.dayOfWeek < 0 || updates.dayOfWeek > 6) {
          return errorResponse(res, 'dayOfWeek must be a number between 0 and 6', 400);
        }
      }
      
      if (updates.multiplier !== undefined && (typeof updates.multiplier !== 'number' || updates.multiplier < 1)) {
        return errorResponse(res, 'Multiplier must be a number greater than or equal to 1', 400);
      }
      
      if (updates.targetGender !== undefined) {
        const validGenders = ['male', 'female', 'all'];
        if (!validGenders.includes(updates.targetGender)) {
          return errorResponse(res, `targetGender must be one of: ${validGenders.join(', ')}`, 400);
        }
      }
      
      const day = await SpecialDayService.updateSpecialDay(id, updates);
      if (!day) {
        return errorResponse(res, 'Special day not found', 404);
      }
      
      successResponse(res, day);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return errorResponse(res, 'Valid special day ID is required', 400);
      }
      
      await SpecialDayService.deleteSpecialDay(id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getTodayMultiplier(req: Request, res: Response) {
    try {
      let gender: string | undefined;
      
      if (req.query.gender && typeof req.query.gender === 'string') {
        gender = req.query.gender;
      }
      
      const result = await SpecialDayService.getTodayMultiplier(gender);
      successResponse(res, result);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const days = await SpecialDayService.getAllSpecialDays();
      const activeDays = days.filter(day => day.isActive === true);
      successResponse(res, activeDays);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;
      
      if (!date || typeof date !== 'string') {
        return errorResponse(res, 'Valid date is required (YYYY-MM-DD)', 400);
      }
      
      // Validation du format de date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return errorResponse(res, 'Date must be in format YYYY-MM-DD', 400);
      }
      
      const days = await SpecialDayService.getAllSpecialDays();
      const dayByDate = days.find(d => d.specificDate === date);
      const dayByWeekday = days.find(d => d.dayOfWeek === new Date(date).getDay());
      
      successResponse(res, {
        specificDate: dayByDate || null,
        weekday: dayByWeekday || null,
      });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const days = await SpecialDayService.getAllSpecialDays();
      
      const totalDays = days.length;
      const activeDays = days.filter(d => d.isActive).length;
      const inactiveDays = totalDays - activeDays;
      
      const daysByTarget = {
        male: days.filter(d => d.targetGender === 'male').length,
        female: days.filter(d => d.targetGender === 'female').length,
        all: days.filter(d => d.targetGender === 'all' || !d.targetGender).length,
      };
      
      const recurrentDays = days.filter(d => d.dayOfWeek !== undefined).length;
      const specificDates = days.filter(d => d.specificDate).length;
      
      const stats = {
        totalDays,
        activeDays,
        inactiveDays,
        daysByTarget,
        recurrentDays,
        specificDates,
      };
      
      successResponse(res, stats);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};