import mongoose, { Schema } from 'mongoose';

const supplementSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const promotionSchema = new Schema({
  type: { type: String, enum: ['percentage', 'fixed', 'offer', 'new', 'popular'] },
  value: Number,
  label: String,
  endDate: String,
});

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: String,
    allergens: [{ type: String }],
    tags: [{ type: String }],
    supplements: [supplementSchema],
    promotion: promotionSchema,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);