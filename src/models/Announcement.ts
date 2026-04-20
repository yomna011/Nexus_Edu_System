import mongoose, { Schema, model, models } from 'mongoose';

export interface IAnnouncement {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EVENT';
  targetAudience: ('STUDENT' | 'PROFESSOR' | 'TA' | 'ADMIN' | 'ALL')[];
  author: mongoose.Types.ObjectId;
  expiresAt?: Date;
  isactive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'URGENT', 'EVENT'], default: 'INFO' },
    targetAudience: [{ type: String, enum: ['STUDENT', 'PROFESSOR', 'TA', 'ADMIN', 'ALL'] }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date },
    isactive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema);