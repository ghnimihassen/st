import mongoose from 'mongoose';

const recipeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🎂' },
  color: { type: String, default: 'bg-amber-100 text-amber-800' },
  isActive: { type: Boolean, default: true },
});

export const RecipeCategory = mongoose.model('RecipeCategory', recipeCategorySchema);