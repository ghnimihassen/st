import mongoose, { Schema } from 'mongoose';

const showcaseItemSchema = new Schema(
  {
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    productionOrderId: { type: Schema.Types.ObjectId, ref: 'ProductionOrder' },
    showcaseId: { type: Schema.Types.ObjectId, ref: 'Showcase', required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    initialQuantity: { type: Number, required: true },
    productionDate: { type: String, required: true },
    productionTime: { type: String, required: true },
    expirationDate: { type: String, required: true },
    expirationTime: { type: String, required: true },
    unitCost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    status: { type: String, enum: ['available', 'low', 'expired', 'sold-out'], default: 'available' },
  },
  {
    timestamps: true, // ← Gère createdAt et updatedAt automatiquement
  }
);

export const ShowcaseItem = mongoose.model('ShowcaseItem', showcaseItemSchema);