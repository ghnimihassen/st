import { Order } from '../models/Order.model';
import { ShowcaseItem } from '../models/ShowcaseItem.model';
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';
import { Types } from 'mongoose';

// Types pour les filtres
interface OrderFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

// Type pour les statistiques
interface OrderStats {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
}

export const OrderService = {
  async getAllOrders(filters: OrderFilters = {}) {
    const query: any = {};
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startDate };
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { ...query.createdAt, $lte: endDate };
    }
    
    if (filters.customerId) {
      query.customerId = new Types.ObjectId(filters.customerId);
    }
    
    const orders = await Order.find(query)
      .populate('customerId')
      .sort({ createdAt: -1 })
      .lean();
    
    return orders;
  },

  async getOrderById(id: string) {
    const order = await Order.findById(id)
      .populate('customerId')
      .lean();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  },

  async createOrder(data: any) {
    const order = new Order(data);
    await order.save();
    
    // Update showcase stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.showcaseItemId) {
          await ShowcaseItem.findByIdAndUpdate(item.showcaseItemId, {
            $inc: { quantity: -item.quantity }
          });
        }
      }
    }
    
    // Add loyalty points if customer
    if (order.customerId && order.pointsEarned && order.pointsEarned > 0) {
      const client = await Client.findById(order.customerId);
      if (client) {
        const pointsToAdd = order.pointsEarned;
        const totalToAdd = order.total || 0;
        
        client.loyaltyPoints = (client.loyaltyPoints || 0) + pointsToAdd;
        client.lifetimePoints = (client.lifetimePoints || 0) + pointsToAdd;
        client.totalSpent = (client.totalSpent || 0) + totalToAdd;
        client.totalOrders = (client.totalOrders || 0) + 1;
        client.lastVisit = new Date();
        
        // Update tier based on lifetime points
        const lifetimePoints = client.lifetimePoints || 0;
        if (lifetimePoints >= 3000) {
          client.tier = 'diamond';
        } else if (lifetimePoints >= 1500) {
          client.tier = 'gold';
        } else if (lifetimePoints >= 500) {
          client.tier = 'silver';
        }
        
        await client.save();
        
        const transaction = new LoyaltyTransaction({
          clientId: client._id,
          type: 'earn',
          points: pointsToAdd,
          description: `Achat: ${order._id}`,
          orderId: order._id,
        });
        await transaction.save();
      }
    }
    
    return order.toObject();
  },

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, lean: true }
    );
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  },

  async getOrderStats(): Promise<OrderStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({ 
      createdAt: { $gte: today },
      status: 'completed'
    });
    
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return { 
      totalSales, 
      totalRevenue, 
      averageTicket 
    };
  },

  async getOrderStatsByDateRange(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });
    
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Ventes par jour
    const salesByDay = new Map<string, { count: number; revenue: number }>();
    
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0] ?? '';
      if (!day) continue;
      
      const existing = salesByDay.get(day);
      if (existing) {
        existing.count++;
        existing.revenue += order.total || 0;
      } else {
        salesByDay.set(day, { count: 1, revenue: order.total || 0 });
      }
    }
    
    const salesByDayArray = Array.from(salesByDay.entries()).map(([day, data]) => ({
      day,
      ...data,
    }));
    
    return {
      totalSales,
      totalRevenue,
      averageTicket,
      salesByDay: salesByDayArray,
    };
  },

  async getCustomerOrders(customerId: string, limit: number = 50) {
    const orders = await Order.find({ 
      customerId: new Types.ObjectId(customerId) 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    
    return {
      orders,
      totalSpent,
      totalOrders,
    };
  },

  async cancelOrder(id: string) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }
    
    // Restore stock if needed
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.showcaseItemId) {
          await ShowcaseItem.findByIdAndUpdate(item.showcaseItemId, {
            $inc: { quantity: item.quantity }
          });
        }
      }
    }
    
    order.status = 'cancelled';
    await order.save();
    
    return order.toObject();
  },
};