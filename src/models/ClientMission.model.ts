import mongoose from 'mongoose';

const clientMissionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  missionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const ClientMission = mongoose.model('ClientMission', clientMissionSchema);