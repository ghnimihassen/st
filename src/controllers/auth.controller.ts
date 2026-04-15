import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      console.log('📝 Login attempt:', req.body.email);  // ← Ajoute ça
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      console.log('📝 Login result:', result);  // ← Ajoute ça
      if (!result) return errorResponse(res, 'Invalid credentials', 401);
      successResponse(res, result);
    } catch (error: any) {
      console.error('❌ Login error:', error);  // ← Ajoute ça
      errorResponse(res, error.message);
    }
  },

  async register(req: Request, res: Response) {
    try {
      console.log('📝 Register attempt:', req.body.email);  // ← Ajoute ça
      const { name, email, password, referralCode } = req.body;
      const result = await AuthService.register(name, email, password, referralCode);
      successResponse(res, result, 201);
    } catch (error: any) {
      console.error('❌ Register error:', error);  // ← Ajoute ça
      errorResponse(res, error.message);
    }
  },

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.getMe(userId);
      if (!user) return errorResponse(res, 'User not found', 404);
      successResponse(res, user);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};