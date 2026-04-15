import mongoose, { Schema } from 'mongoose';

const menuCategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);