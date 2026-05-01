import mongoose, { Schema, model, models } from 'mongoose';

export interface IEnrollment {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'ENROLLED' | 'DROPPED' | 'COMPLETED';
  grade?: string;
  gradeStatus?: 'IN_PROGRESS' | 'OFFICIAL';
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ENROLLED', 'DROPPED', 'COMPLETED'], default: 'ENROLLED' },
    grade: { type: String },
    gradeStatus: { type: String, enum: ['IN_PROGRESS', 'OFFICIAL'], default: 'IN_PROGRESS' },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment in same course/semester for a student
EnrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

export default models.Enrollment || model<IEnrollment>('Enrollment', EnrollmentSchema);