import mongoose, { Schema } from 'mongoose';

const specialDaySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    targetGender: { type: String, enum: ['male', 'female', 'all'] },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    specificDate: String,
    multiplier: { type: Number, default: 1 },
    bonusPoints: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SpecialDay = mongoose.model('SpecialDay', specialDaySchema);