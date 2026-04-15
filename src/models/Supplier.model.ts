import mongoose, { Schema } from 'mongoose';

const supplierSchema = new Schema(
  {
    name: { type: String, required: true },
    contactName: String,
    email: String,
    phone: String,
    address: String,
    notes: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model('Supplier', supplierSchema);