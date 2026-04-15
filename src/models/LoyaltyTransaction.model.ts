import mongoose, { Schema } from 'mongoose';

const loyaltyTransactionSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  type: { type: String, enum: ['earn', 'redeem', 'bonus', 'adjustment', 'game_win', 'referral', 'mission', 'special_day'], required: true },
  points: { type: Number, required: true },
  description: { type: String, required: true },
  orderId: String,
  staffId: String,
}, { timestamps: true });

export const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);