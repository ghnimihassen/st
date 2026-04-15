import { Order } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { Batch } from '../models/Batch.model';
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';

// Type pour les statistiques par jour
interface DayStats {
  total: number;
  count: number;
}

// Type pour les activités de fidélité
interface ActivityStats {
  earned: number;
  redeemed: number;
}

// Type pour les produits en alerte
interface StockAlert {
  id: any;
  name: string;
  stock: number;
  minQuantity: number;
  unit: string;
}

// Type pour les produits expirants
interface ExpiringProduct {
  batchId: any;
  batchNumber: string;
  productId: any;
  productName: string;
  quantity: number;
  expirationDate: string;
  daysLeft: number;
  isOpened: boolean;
}

export const DashboardService = {
  async getOverview() {
    const totalProducts = await Product.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalClients = await Client.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await Order.find({ createdAt: { $gte: today } });
    const todayRevenue = todaySales.reduce((sum, o) => sum + o.total, 0);
    
    const lowStockProducts = await Product.find({ isActive: true });
    let lowStockCount = 0;
    for (const product of lowStockProducts) {
      const batches = await Batch.find({ productId: product._id });
      const stock = batches.reduce((sum, b) => sum + b.quantity, 0);
      const minQty = product.minQuantity ?? 0;
      if (stock <= minQty) lowStockCount++;
    }
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);
    
    const todayStr = new Date().toISOString().split('T')[0] ?? '';
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0] ?? '';
    
    const expiringBatches = await Batch.find({
      $or: [
        { 
          isOpened: false, 
          expirationDate: { 
            $lte: thirtyDaysStr,
            $gte: todayStr
          } 
        },
        { 
          isOpened: true, 
          expirationAfterOpening: { 
            $lte: thirtyDaysStr,
            $gte: todayStr
          } 
        }
      ],
      quantity: { $gt: 0 }
    });
    
    return {
      totalProducts,
      totalBatches,
      totalClients,
      todaySales: todaySales.length,
      todayRevenue,
      lowStockCount,
      expiringCount: expiringBatches.length,
    };
  },

  async getSalesByDay(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({ createdAt: { $gte: startDate } });
    
    const salesByDay = new Map<string, DayStats>();
    
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0] ?? '';
      if (!day) continue;
      
      const existing = salesByDay.get(day);
      if (existing) {
        existing.total += order.total;
        existing.count += 1;
      } else {
        salesByDay.set(day, { total: order.total, count: 1 });
      }
    }
    
    // Trier par date
    const sortedDays = Array.from(salesByDay.keys()).sort();
    return sortedDays.map((day) => ({
      day,
      total: salesByDay.get(day)?.total ?? 0,
      count: salesByDay.get(day)?.count ?? 0,
    }));
  },

  async getTopItems(limit: number = 10) {
    const orders = await Order.find();
    const itemStats = new Map<string, { 
      recipeId: string; 
      name: string; 
      quantity: number; 
      revenue: number;
    }>();
    
    for (const order of orders) {
      for (const item of order.items) {
        const recipeId = item.recipeId?.toString() ?? '';
        if (!recipeId) continue;
        
        const existing = itemStats.get(recipeId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          itemStats.set(recipeId, { 
            recipeId,
            name: item.recipeName, 
            quantity: item.quantity, 
            revenue: item.total 
          });
        }
      }
    }
    
    return Array.from(itemStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  async getTierDistribution() {
    const clients = await Client.find();
    const distribution = {
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0,
    };
    
    for (const client of clients) {
      const tier = client.tier ?? 'bronze';
      switch (tier) {
        case 'bronze': distribution.bronze++; break;
        case 'silver': distribution.silver++; break;
        case 'gold': distribution.gold++; break;
        case 'diamond': distribution.diamond++; break;
        default: distribution.bronze++;
      }
    }
    
    return [
      { tier: 'bronze', count: distribution.bronze, color: '#CD7F32' },
      { tier: 'silver', count: distribution.silver, color: '#C0C0C0' },
      { tier: 'gold', count: distribution.gold, color: '#FFD700' },
      { tier: 'diamond', count: distribution.diamond, color: '#B9F2FF' },
    ];
  },

  async getLoyaltyActivity(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const transactions = await LoyaltyTransaction.find({ 
      createdAt: { $gte: startDate } 
    });
    
    const activityByDay = new Map<string, ActivityStats>();
    
    // Initialiser tous les jours dans la période
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0] ?? '';
      if (dayKey) {
        activityByDay.set(dayKey, { earned: 0, redeemed: 0 });
      }
    }
    
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().split('T')[0] ?? '';
      if (!day) continue;
      
      const existing = activityByDay.get(day);
      if (existing) {
        if (tx.points > 0) {
          existing.earned += tx.points;
        } else {
          existing.redeemed += Math.abs(tx.points);
        }
      }
    }
    
    // Trier par date croissante
    const sortedDays = Array.from(activityByDay.keys()).sort();
    return sortedDays.map((day) => ({
      day,
      earned: activityByDay.get(day)?.earned ?? 0,
      redeemed: activityByDay.get(day)?.redeemed ?? 0,
    }));
  },

  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Ventes par jour du mois
    const salesByDay = new Map<number, { count: number; revenue: number }>();
    for (const order of orders) {
      const day = order.createdAt.getDate();
      const existing = salesByDay.get(day);
      if (existing) {
        existing.count++;
        existing.revenue += order.total;
      } else {
        salesByDay.set(day, { count: 1, revenue: order.total });
      }
    }
    
    const salesByDayObject: Record<number, { count: number; revenue: number }> = {};
    for (const [day, value] of salesByDay) {
      salesByDayObject[day] = value;
    }
    
    return {
      year,
      month,
      totalRevenue,
      totalOrders,
      averageOrder,
      salesByDay: salesByDayObject,
    };
  },

  async getTopClients(limit: number = 10) {
    const clients = await Client.find({ isActive: true })
      .sort({ totalSpent: -1 })
      .limit(limit);
    
    return clients.map(client => ({
      id: client._id,
      name: client.name,
      email: client.email,
      totalSpent: client.totalSpent ?? 0,
      totalOrders: client.totalOrders ?? 0,
      loyaltyPoints: client.loyaltyPoints ?? 0,
      tier: client.tier ?? 'bronze',
    }));
  },

  async getStockAlerts(): Promise<{ lowStock: StockAlert[]; outOfStock: StockAlert[]; totalLowStock: number; totalOutOfStock: number }> {
    const products = await Product.find({ isActive: true });
    const lowStock: StockAlert[] = [];
    const outOfStock: StockAlert[] = [];
    
    for (const product of products) {
      const batches = await Batch.find({ productId: product._id });
      const stock = batches.reduce((sum, b) => sum + b.quantity, 0);
      const minQuantity = product.minQuantity ?? 0;
      
      if (stock === 0) {
        outOfStock.push({
          id: product._id,
          name: product.name,
          stock,
          minQuantity,
          unit: product.unit,
        });
      } else if (stock <= minQuantity) {
        lowStock.push({
          id: product._id,
          name: product.name,
          stock,
          minQuantity,
          unit: product.unit,
        });
      }
    }
    
    return {
      lowStock,
      outOfStock,
      totalLowStock: lowStock.length,
      totalOutOfStock: outOfStock.length,
    };
  },

  async getExpiringProducts(daysThreshold: number = 7): Promise<ExpiringProduct[]> {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    
    const todayStr = today.toISOString().split('T')[0] ?? '';
    const thresholdStr = threshold.toISOString().split('T')[0] ?? '';
    
    const batches = await Batch.find({
      $or: [
        { isOpened: false, expirationDate: { $gte: todayStr, $lte: thresholdStr } },
        { isOpened: true, expirationAfterOpening: { $gte: todayStr, $lte: thresholdStr } }
      ],
      quantity: { $gt: 0 }
    }).populate('productId');
    
    const result: ExpiringProduct[] = [];
    for (const batch of batches) {
      const product = batch.productId as any;
      const expDate = batch.isOpened ? batch.expirationAfterOpening : batch.expirationDate;
      if (expDate) {
        const daysLeft = Math.ceil(
          (new Date(expDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        result.push({
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          productId: product?._id,
          productName: product?.name ?? 'Inconnu',
          quantity: batch.quantity,
          expirationDate: expDate,
          daysLeft,
          isOpened: batch.isOpened ?? false,
        });
      }
    }
    
    return result;
  },
};