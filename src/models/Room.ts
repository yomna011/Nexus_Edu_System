import mongoose, { Schema, model, models } from 'mongoose';

export interface IRoom {
  name: string;
  building: string;
  type: 'CLASSROOM' | 'LAB' | 'LECTURE_HALL';
  capacity: number;
  equipment?: string[];
  status: 'AVAILABLE' | 'MAINTENANCE';
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  building: { type: String, required: true },
  type: { type: String, enum: ['CLASSROOM', 'LAB', 'LECTURE_HALL'], required: true },
  capacity: { type: Number, required: true },
  equipment: [String],
  status: { type: String, enum: ['AVAILABLE', 'MAINTENANCE'], default: 'AVAILABLE' },
});

export default models.Room || model<IRoom>('Room', RoomSchema);