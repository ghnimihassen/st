import mongoose, { Schema } from 'mongoose';

const stockCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    color: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StockCategory = mongoose.model('StockCategory', stockCategorySchema);