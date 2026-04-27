import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  role: 'STUDENT' | 'PROFESSOR' | 'TA' | 'ADMIN' | 'IT_ADMIN';
  name: string;
  nationalId?: string;
  department?: mongoose.Types.ObjectId;
  forcePasswordChange: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  officeHours?: string; // For professors and TAs
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'PROFESSOR', 'TA', 'ADMIN', 'IT_ADMIN'],
      required: true,
    },
    name: { type: String, required: true },
    nationalId: { type: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    forcePasswordChange: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    officeHours: { type: String }, // e.g., "Mon/Wed 2-4 PM"
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);