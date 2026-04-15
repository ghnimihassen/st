import mongoose, { Schema } from 'mongoose';

const batchSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    locationId: { type: Schema.Types.ObjectId, ref: 'StorageLocation' },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    receptionDate: { type: String, required: true },
    productionDate: String,
    expirationDate: { type: String, required: true },
    openingDate: String,
    expirationAfterOpening: String,
    isOpened: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

export const Batch = mongoose.model('Batch', batchSchema);