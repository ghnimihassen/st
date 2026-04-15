import mongoose, { Schema } from 'mongoose';

const showcaseSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['refrigerated', 'ambient', 'frozen', 'heated'], required: true },
    temperature: String,
    capacity: Number,
    location: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // ← Gère createdAt et updatedAt automatiquement
  }
);

export const Showcase = mongoose.model('Showcase', showcaseSchema);