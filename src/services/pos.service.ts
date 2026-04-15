import { Client } from '../models/Client.model';
import { Order } from '../models/Order.model';
import { ShowcaseItem } from '../models/ShowcaseItem.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';
import { SpecialDay } from '../models/SpecialDay.model';
import { Types } from 'mongoose';

// Types
interface PurchaseItem {
  showcaseItemId: string;
  quantity: number;
}

interface PurchaseData {
  clientId: string;
  items: PurchaseItem[];
  paymentMethod: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  pointsToUse?: number;
  cashierId?: string;
}

interface PointsCalculationResult {
  points: number;
  multiplier: number;
  bonusPoints: number;
  specialDayName?: string;
}

export const POSService = {
  async findClient(query: string) {
    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }
    
    const client = await Client.findOne({
      $or: [
        { qrCode: query },
        { email: query },
        { phone: query }
      ]
    }).lean();
    
    if (!client) throw new Error('Client not found');
    return client;
  },

  async calculatePoints(amount: number, gender?: string | null): Promise<PointsCalculationResult> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const today = now.toISOString().split('T')[0] ?? '';
    
    const specialDay = await SpecialDay.findOne({
      isActive: true,
      $or: [{ dayOfWeek }, { specificDate: today }]
    }).lean();
    
    let multiplier = 1;
    let bonusPoints = 0;
    let specialDayName: string | undefined = undefined;
    
    if (specialDay) {
      const targetGender = specialDay.targetGender;
      const isGenderMatch = !targetGender || 
                            targetGender === 'all' || 
                            (gender && targetGender === gender);
      
      if (isGenderMatch) {
        multiplier = specialDay.multiplier ?? 1;
        bonusPoints = specialDay.bonusPoints ?? 0;
        specialDayName = specialDay.name;
      }
    }
    
    const basePoints = Math.floor(Math.max(0, amount));
    const points = Math.floor(basePoints * multiplier) + bonusPoints;
    
    return { points, multiplier, bonusPoints, specialDayName };
  },

  async processPurchase(data: PurchaseData) {
    // Validation des données d'entrée
    if (!data.clientId) {
      throw new Error('Client ID is required');
    }
    if (!data.items || data.items.length === 0) {
      throw new Error('At least one item is required');
    }
    if (!data.paymentMethod) {
      throw new Error('Payment method is required');
    }
    
    let subtotal = 0;
    const saleItems = [];
    
    // Traitement des articles
    for (const item of data.items) {
      const showcaseItem = await ShowcaseItem.findById(item.showcaseItemId);
      if (!showcaseItem) {
        throw new Error(`Item ${item.showcaseItemId} not found`);
      }
      if (showcaseItem.quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.showcaseItemId}. Available: ${showcaseItem.quantity}, Requested: ${item.quantity}`);
      }
      
      const total = showcaseItem.sellingPrice * item.quantity;
      subtotal += total;
      
      saleItems.push({
        showcaseItemId: item.showcaseItemId,
        recipeId: showcaseItem.recipeId,
        recipeName: (showcaseItem as any).recipeName || 'Product',
        quantity: item.quantity,
        unitPrice: showcaseItem.sellingPrice,
        total,
      });
      
      // Mettre à jour le stock
      showcaseItem.quantity -= item.quantity;
      await showcaseItem.save();
    }
    
    // Calcul des réductions
    let discountAmount = 0;
    const discount = data.discount ?? 0;
    
    if (data.discountType === 'percentage') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const pointsToUse = data.pointsToUse ?? 0;
    const pointsDiscount = pointsToUse * 0.01;
    const total = Math.max(0, subtotal - discountAmount - pointsDiscount);
    
    // Récupérer le client
    const client = await Client.findById(data.clientId);
    let pointsEarned = 0;
    
    if (client) {
      const gender = client.gender ?? undefined;
      const { points } = await this.calculatePoints(total, gender);
      pointsEarned = points;
    }
    
    // Créer la commande
    const order = new Order({
      items: saleItems,
      subtotal,
      discount: discountAmount + pointsDiscount,
      discountType: data.discountType === 'percentage' ? 'percentage' : 'fixed',
      total,
      paymentMethod: data.paymentMethod,
      customerId: data.clientId,
      pointsEarned,
      pointsUsed: pointsToUse,
      cashierId: data.cashierId,
      status: 'completed',
      createdAt: new Date(),
    });
    await order.save();
    
    // Mettre à jour le client
    if (client) {
      // Utilisation des points
      if (pointsToUse > 0) {
        client.loyaltyPoints = (client.loyaltyPoints || 0) - pointsToUse;
        const redeemTransaction = new LoyaltyTransaction({
          clientId: client._id,
          type: 'redeem',
          points: -pointsToUse,
          description: `Utilisation points - ${order._id}`,
          orderId: order._id,
        });
        await redeemTransaction.save();
      }
      
      // Ajout des points gagnés
      if (pointsEarned > 0) {
        client.loyaltyPoints = (client.loyaltyPoints || 0) + pointsEarned;
        client.lifetimePoints = (client.lifetimePoints || 0) + pointsEarned;
        
        const earnTransaction = new LoyaltyTransaction({
          clientId: client._id,
          type: 'earn',
          points: pointsEarned,
          description: `Achat - ${order._id}`,
          orderId: order._id,
        });
        await earnTransaction.save();
      }
      
      // Mise à jour des statistiques client
      client.totalSpent = (client.totalSpent || 0) + total;
      client.totalOrders = (client.totalOrders || 0) + 1;
      client.lastVisit = new Date();
      
      // Mise à jour du tier
      const lifetimePoints = client.lifetimePoints || 0;
      if (lifetimePoints >= 3000) {
        client.tier = 'diamond';
      } else if (lifetimePoints >= 1500) {
        client.tier = 'gold';
      } else if (lifetimePoints >= 500) {
        client.tier = 'silver';
      }
      
      await client.save();
    }
    
    return order.toObject();
  },

  async getClientTransactions(clientId: string) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const transactions = await LoyaltyTransaction.find({ 
      clientId: new Types.ObjectId(clientId) 
    })
      .sort({ createdAt: -1 })
      .lean();
    
    return transactions;
  },

  async addManualPoints(clientId: string, points: number, reason: string) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    if (points === 0) {
      throw new Error('Points must be non-zero');
    }
    if (!reason || reason.trim() === '') {
      throw new Error('Reason is required');
    }
    
    const client = await Client.findById(clientId);
    if (!client) throw new Error('Client not found');
    
    client.loyaltyPoints = (client.loyaltyPoints || 0) + points;
    if (points > 0) {
      client.lifetimePoints = (client.lifetimePoints || 0) + points;
    }
    await client.save();
    
    const transaction = new LoyaltyTransaction({
      clientId: client._id,
      type: 'adjustment',
      points,
      description: reason,
    });
    await transaction.save();
    
    return { 
      client: client.toObject(), 
      transaction: transaction.toObject() 
    };
  },

  async getCurrentCart(clientId: string) {
    // Cette méthode peut être utilisée pour récupérer un panier en cours
    // Implémentation selon les besoins
    return { items: [], total: 0 };
  },

  async validateDiscountCode(code: string, amount: number) {
    // Cette méthode peut être étendue pour gérer des codes promo
    // Pour l'instant, retourne un résultat par défaut
    return {
      valid: false,
      discountAmount: 0,
      message: 'No discount code system implemented yet',
    };
  },
};