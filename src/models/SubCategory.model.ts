import mongoose, { Schema } from 'mongoose';

const subCategorySchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'StockCategory', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubCategory = mongoose.model('SubCategory', subCategorySchema);