import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
  {
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    name: { type: String, required: true },
    description: String,
    unit: { type: String, enum: ['kg', 'g', 'L', 'ml', 'pieces', 'sachets', 'boites'], required: true },
    minQuantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    shelfLifeAfterOpening: Number,
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    defaultLocationId: { type: Schema.Types.ObjectId, ref: 'StorageLocation' },
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);