import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['super_admin', 'admin', 'manager', 'employee', 'cashier'], default: 'employee' },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

export const Employee = mongoose.model('Employee', employeeSchema);