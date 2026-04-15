import { ShareLink } from '../models/Sharelink.model';
import { Types } from 'mongoose';

// Types
interface ShareLinkInfo {
  productName: string;
  referrerName: string;
  isValid: boolean;
}

interface ShareStats {
  totalLinks: number;
  clickedLinks: number;
  clicksToday: number;
  activeLinks: number;
  expiredLinks: number;
  conversionRate: number;
}

export const ShareService = {
  async getAllShareLinks() {
    const links = await ShareLink.find()
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return links;
  },

  async getShareLinkById(id: string) {
    const link = await ShareLink.findById(id)
      .populate('clientId', 'name email')
      .lean();
    
    if (!link) {
      throw new Error('Share link not found');
    }
    
    return link;
  },

  async createShareLink(clientId: string, productId: string, productName: string, platform: string) {
    // Validation des entrées
    if (!clientId) throw new Error('Client ID is required');
    if (!productId) throw new Error('Product ID is required');
    if (!productName) throw new Error('Product name is required');
    if (!platform) throw new Error('Platform is required');
    
    const code = `SHARE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(23, 59, 59, 999);
    
    const link = new ShareLink({
      clientId: new Types.ObjectId(clientId),
      code,
      productId,
      productName,
      platform,
      expiresAt,
      isClicked: false,
      createdAt: new Date(),
    });
    
    await link.save();
    return link.toObject();
  },

  async validateShareLink(code: string) {
    if (!code) {
      throw new Error('Share code is required');
    }
    
    const link = await ShareLink.findOne({ code });
    if (!link) {
      throw new Error('Link not found');
    }
    
    if (link.isClicked) {
      throw new Error('Link already used');
    }
    
    const now = new Date();
    const expiresAt = new Date(link.expiresAt);
    
    if (expiresAt < now) {
      throw new Error('Link expired');
    }
    
    link.isClicked = true;
    link.clickedAt = new Date();
    await link.save();
    
    return link.toObject();
  },

  async getShareLinkInfo(code: string): Promise<ShareLinkInfo> {
    if (!code) {
      throw new Error('Share code is required');
    }
    
    const link = await ShareLink.findOne({ code })
      .populate('clientId', 'name email')
      .lean();
    
    if (!link) {
      throw new Error('Link not found');
    }
    
    const now = new Date();
    const expiresAt = new Date(link.expiresAt);
    const isValid = !link.isClicked && expiresAt > now;
    
    return {
      productName: link.productName,
      referrerName: (link.clientId as any)?.name ?? 'Unknown',
      isValid,
    };
  },

  async getMyShareLinks(clientId: string) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const links = await ShareLink.find({ 
      clientId: new Types.ObjectId(clientId) 
    })
      .sort({ createdAt: -1 })
      .lean();
    
    // Ajouter le statut de validité pour chaque lien
    const now = new Date();
    return links.map(link => ({
      ...link,
      isValid: !link.isClicked && new Date(link.expiresAt) > now,
      expiresIn: Math.ceil((new Date(link.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60)),
    }));
  },

  async getShareStats(): Promise<ShareStats> {
    const totalLinks = await ShareLink.countDocuments();
    const clickedLinks = await ShareLink.countDocuments({ isClicked: true });
    
    // Calculer les clics d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const clicksToday = await ShareLink.countDocuments({
      clickedAt: { $gte: today }
    });
    
    // Statistiques supplémentaires
    const now = new Date();
    const activeLinks = await ShareLink.countDocuments({
      isClicked: false,
      expiresAt: { $gt: now }
    });
    
    const expiredLinks = await ShareLink.countDocuments({
      isClicked: false,
      expiresAt: { $lte: now }
    });
    
    // Taux de conversion
    const conversionRate = totalLinks > 0 ? (clickedLinks / totalLinks) * 100 : 0;
    
    return {
      totalLinks,
      clickedLinks,
      clicksToday,
      activeLinks,
      expiredLinks,
      conversionRate,
    };
  },

  async deleteExpiredLinks() {
    const result = await ShareLink.deleteMany({
      expiresAt: { $lt: new Date() },
      isClicked: false
    });
    
    return {
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} expired links deleted`,
    };
  },

  async getShareLinksByProduct(productId: string) {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const links = await ShareLink.find({ productId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    const now = new Date();
    const stats = {
      total: links.length,
      clicked: links.filter(l => l.isClicked).length,
      pending: links.filter(l => !l.isClicked && new Date(l.expiresAt) > now).length,
      expired: links.filter(l => !l.isClicked && new Date(l.expiresAt) <= now).length,
    };
    
    return { links, stats };
  },

  async getShareLinksByPlatform(platform: string) {
    if (!platform) {
      throw new Error('Platform is required');
    }
    
    const links = await ShareLink.find({ platform })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    const clickedCount = links.filter(l => l.isClicked).length;
    const clickRate = links.length > 0 ? (clickedCount / links.length) * 100 : 0;
    
    return {
      platform,
      total: links.length,
      clicked: clickedCount,
      clickRate,
      links,
    };
  },

  async getShareLinkByCode(code: string) {
    if (!code) {
      throw new Error('Share code is required');
    }
    
    const link = await ShareLink.findOne({ code })
      .populate('clientId', 'name email')
      .lean();
    
    if (!link) {
      throw new Error('Share link not found');
    }
    
    return link;
  },

  async updateShareLink(id: string, updates: Partial<{ isClicked: boolean; clickedAt: Date }>) {
    const link = await ShareLink.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, lean: true }
    );
    
    if (!link) {
      throw new Error('Share link not found');
    }
    
    return link;
  },

  async deleteShareLink(id: string) {
    const result = await ShareLink.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Share link not found');
    }
    return { success: true, message: 'Share link deleted successfully' };
  },
};