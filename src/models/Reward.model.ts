import mongoose, { Schema } from 'mongoose';

const rewardSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointsCost: { type: Number, required: true },
    type: { type: String, enum: ['discount', 'free_item', 'special', 'percentage'], required: true },
    value: { type: String, required: true },
    image: String,
    minTier: { type: String, enum: ['bronze', 'silver', 'gold', 'diamond'] },
    isActive: { type: Boolean, default: true },
    stock: Number,
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Reward = mongoose.model('Reward', rewardSchema);