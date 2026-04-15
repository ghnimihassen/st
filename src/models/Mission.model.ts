// backend/src/models/Mission.model.ts
import mongoose, { Schema } from 'mongoose';

const missionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['visit', 'spend', 'refer', 'birthday', 'review', 'social', 'challenge'], required: true },
    target: { type: Number, required: true, default: 1 },
    pointsReward: { type: Number, required: true },  // ← pointsReward (pas reward)
    bonusReward: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: "star" },
    maxCompletions: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Mission = mongoose.model('Mission', missionSchema);