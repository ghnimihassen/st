import mongoose, { Schema } from 'mongoose';

const clientSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    birthDate: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    qrCode: { type: String, unique: true },
    loyaltyPoints: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'diamond'], default: 'bronze' },
    totalSpent: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: String,
    referralCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastVisit: Date,
  },
  { timestamps: true }
);

export const Client = mongoose.model('Client', clientSchema);