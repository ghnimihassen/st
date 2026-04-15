import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { Client } from '../models/Client.model';
import { Employee } from '../models/Employee.model';
import { generateToken } from '../utils/jwt';

export const AuthService = {
  async login(email: string, password: string) {
    let user = await User.findOne({ email });
    
    if (!user) {
      const employee = await Employee.findOne({ email, isActive: true });
      if (employee) {
        const valid = await bcrypt.compare(password, employee.password);
        if (valid) {
          const token = generateToken({
            id: employee.id,
            email,
            role: 'admin',
            employeeRole: employee.role,
            permissions: employee.permissions,
          });
          return {
            token,
            user: {
              id: employee.id,
              name: employee.name,
              email,
              role: 'admin',
              employeeRole: employee.role,
              permissions: employee.permissions,
            },
          };
        }
      }
      
      const client = await Client.findOne({ email });
      if (client) {
        const token = generateToken({ id: client.id, email, role: 'client' });
        return { token, user: { id: client.id, name: client.name, email, role: 'client', loyaltyPoints: client.loyaltyPoints, totalSpent: client.totalSpent } };
      }
      
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const normalizedRole = user.role === 'staff' ? 'admin' : user.role;
    const token = generateToken({ id: user.id, email, role: normalizedRole });
    return { token, user: { id: user.id, name: user.name, email, role: normalizedRole } };
  },

  async register(name: string, email: string, password: string, referralCode?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: 'client' });
    await user.save();

    const client = new Client({
      name,
      email,
      loyaltyPoints: 0,
      walletBalance: 0,
      tier: 'bronze',
      referralCode: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      qrCode: `QR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });
    await client.save();

    if (referralCode) {
      const referrer = await Client.findOne({ referralCode });
      if (referrer) {
        const { Referral } = await import('../models/Referral.model');
        const referral = new (await import('../models/Referral.model')).Referral({
          referrerId: referrer.id,
          referredId: client.id,
          referredName: name,
          referredEmail: email,
          status: 'first_purchase_pending',
          referrerReward: 100,
          referredReward: 50,
        });
        await referral.save();
        client.loyaltyPoints += 50;
        await client.save();
      }
    }

    const token = generateToken({ id: user.id, email, role: 'client' });
    return { token, user: { id: user.id, name, email, role: 'client', loyaltyPoints: client.loyaltyPoints } };
  },

  async getMe(userId: string) {
    let user = await User.findById(userId);
    if (!user) {
      let client = await Client.findById(userId);
      if (client) {
        return { id: client.id, name: client.name, email: client.email, role: 'client', loyaltyPoints: client.loyaltyPoints, totalSpent: client.totalSpent };
      }
      let employee = await Employee.findById(userId);
      if (employee) {
        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: 'admin',
          employeeRole: employee.role,
          permissions: employee.permissions,
        };
      }
      return null;
    }
    const normalizedRole = user.role === 'staff' ? 'admin' : user.role;
    return { id: user.id, name: user.name, email: user.email, role: normalizedRole };
  },
};