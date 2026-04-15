import mongoose, { Schema } from 'mongoose';

const shareLinkSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  code: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  platform: { type: String, required: true },
  isClicked: { type: Boolean, default: false },
  clickedAt: Date,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export const ShareLink = mongoose.model('ShareLink', shareLinkSchema);