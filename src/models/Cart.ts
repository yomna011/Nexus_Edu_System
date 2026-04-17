import mongoose, { Schema, model, models } from 'mongoose';

export interface ICartItem {
  course: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface ICart {
  student: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  addedAt: { type: Date, default: Date.now },
});

const CartSchema = new Schema<ICart>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// Ensure one cart per student per semester
CartSchema.index({ student: 1, semester: 1 }, { unique: true });

export default models.Cart || model<ICart>('Cart', CartSchema);