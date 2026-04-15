import mongoose, { Schema } from 'mongoose';

const recipeIngredientSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const recipeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'RecipeCategory', required: true },
    ingredients: [recipeIngredientSchema],
    yield: { type: Number, required: true },
    yieldUnit: { type: String, default: 'pieces' },
    preparationTime: { type: Number, default: 0 },
    cookingTime: { type: Number, default: 0 },
    shelfLife: { type: Number, default: 24 },
    sellingPrice: { type: Number, required: true },
    image: String,
    instructions: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // ← Gère createdAt et updatedAt automatiquement
  }
);

export const Recipe = mongoose.model('Recipe', recipeSchema);