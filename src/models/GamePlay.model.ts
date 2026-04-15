import mongoose from 'mongoose';

const gamePlaySchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  gameType: { type: String, enum: ['roulette', 'chichbich', 'share_spin'], required: true },
  result: { type: String, enum: ['win', 'lose'], required: true },
  prize: {
    type: { type: String, enum: ['points', 'discount', 'free_item'] },
    value: Number,
    description: String,
  },
  playedAt: { type: Date, default: Date.now },
});

export const GamePlay = mongoose.model('GamePlay', gamePlaySchema);