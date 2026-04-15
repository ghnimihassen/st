import mongoose, { Schema } from 'mongoose';

const productionOrderSchema = new Schema(
  {
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    showcaseId: { type: Schema.Types.ObjectId, ref: 'Showcase', required: true },
    quantity: { type: Number, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: String,
    status: { type: String, enum: ['planned', 'in-progress', 'completed', 'cancelled'], default: 'planned' },
    producedBy: String,
    startedAt: Date,
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true, // ← Gère createdAt et updatedAt automatiquement
  }
);

export const ProductionOrder = mongoose.model('ProductionOrder', productionOrderSchema);