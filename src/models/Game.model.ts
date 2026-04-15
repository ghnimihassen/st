import mongoose, { Schema } from 'mongoose';

const gameRewardSchema = new Schema({
  id: String,
  name: String,
  points: Number,
  probability: Number,
  color: String,
});

const gameSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['roulette', 'chichbich'], required: true },
    enabled: { type: Boolean, default: true },
    startHour: { type: Number, default: 10 },
    endHour: { type: Number, default: 22 },
    maxPlaysPerDay: { type: Number, default: 3 },
    minPointsRequired: { type: Number, default: 0 },
    rewards: [gameRewardSchema],
  },
  { timestamps: true }
);

export const Game = mongoose.model('Game', gameSchema);