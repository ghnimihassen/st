import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.model';

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['dashboard', 'articles', 'menu', 'categories', 'suppliers', 'batches', 'alerts', 'clients', 'clients_loyalty', 'rewards', 'missions', 'games', 'special_days', 'referrals', 'pos', 'employees', 'production'],
  admin: ['dashboard', 'articles', 'menu', 'categories', 'suppliers', 'batches', 'alerts', 'clients', 'clients_loyalty', 'rewards', 'missions', 'games', 'special_days', 'referrals', 'pos', 'production'],
  manager: ['dashboard', 'articles', 'menu', 'batches', 'alerts', 'clients', 'clients_loyalty', 'pos', 'production'],
  employee: ['dashboard', 'pos'],
  cashier: ['dashboard', 'pos', 'clients', 'clients_loyalty'],
};

export const EmployeeService = {
  async getAllEmployees(search?: string) {
    let query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    return employees.map(e => ({ ...e.toObject(), password: undefined }));
  },

  async createEmployee(data: any) {
    const hashedPassword = await bcrypt.hash(data.password || 'employee123', 10);
    const employee = new Employee({
      ...data,
      password: hashedPassword,
      permissions: DEFAULT_PERMISSIONS[data.role] || [],
    });
    await employee.save();
    const { password, ...rest } = employee.toObject();
    return rest;
  },

  async updateEmployee(id: string, updates: any) {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }
    
    const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    if (!employee) throw new Error('Employee not found');
    const { password, ...rest } = employee.toObject();
    return rest;
  },

  async deleteEmployee(id: string) {
    await Employee.findByIdAndDelete(id);
    return true;
  },

  async resetPermissions(id: string, role: string) {
    const employee = await Employee.findByIdAndUpdate(
      id,
      { permissions: DEFAULT_PERMISSIONS[role] || [] },
      { new: true }
    );
    if (!employee) throw new Error('Employee not found');
    return employee;
  },
};