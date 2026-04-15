import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
  showcaseItemId: { type: Schema.Types.ObjectId, ref: 'ShowcaseItem' },
  recipeId: { type: String, required: true },
  recipeName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new Schema(
  {
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile', 'wallet'], required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Client' },
    pointsEarned: Number,
    pointsUsed: Number,
    cashierId: String,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);