import type { Response } from 'express';

export const successResponse = (res: Response, data: any, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const errorResponse = (res: Response, message: string, status = 400) => {
  res.status(status).json({ success: false, error: message });
};