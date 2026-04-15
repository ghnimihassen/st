import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { successResponse, errorResponse } from '../utils/response';

export const EmployeeController = {
  async getAll(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const employees = await EmployeeService.getAllEmployees(search as string);
      successResponse(res, employees);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      successResponse(res, employee, 201);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
      successResponse(res, employee);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await EmployeeService.deleteEmployee(req.params.id);
      successResponse(res, { success: true });
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },

  async resetPermissions(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const employee = await EmployeeService.resetPermissions(req.params.id, role);
      successResponse(res, employee);
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  },
};