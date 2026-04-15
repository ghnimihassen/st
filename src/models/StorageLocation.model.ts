import mongoose, { Schema } from 'mongoose';

const storageLocationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['refrigerator', 'freezer', 'room', 'shelf', 'other'], required: true },
    description: String,
    temperature: String,
    capacity: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StorageLocation = mongoose.model('StorageLocation', storageLocationSchema);