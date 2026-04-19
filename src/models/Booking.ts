import mongoose, { Schema, model, models } from 'mongoose';

export interface IBooking {
  room: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'APPROVED', // Auto-approve for simplicity; can be changed later
    },
  },
  { timestamps: true }
);

// Prevent overlapping bookings for the same room
BookingSchema.index({ room: 1, startTime: 1, endTime: 1 });

export default models.Booking || model<IBooking>('Booking', BookingSchema);