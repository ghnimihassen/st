import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  referredName: { type: String, required: true },
  referredEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'first_purchase_pending', 'completed', 'rewarded'], default: 'pending' },
  referrerReward: { type: Number, default: 100 },
  referredReward: { type: Number, default: 50 },
  firstPurchaseAmount: Number,
  firstPurchaseDate: Date,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

export const Referral = mongoose.model('Referral', referralSchema);