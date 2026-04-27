import mongoose, { Schema, model, models } from 'mongoose';

export interface ISemester {
  name: string;
  termType: 'FALL' | 'SPRING' | 'SUMMER';
  academicYear: string;
  startDate: Date;
  endDate: Date;
  addDropDeadline: Date;
  finalExamStart: Date;
  status: 'DRAFT' | 'active' | 'ARCHIVED';
  isRegistrationTerm: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    name: { type: String, required: true },
    termType: { type: String, enum: ['FALL', 'SPRING', 'SUMMER'], required: true },
    academicYear: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    addDropDeadline: { type: Date, required: true },
    finalExamStart: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'active', 'ARCHIVED'], default: 'DRAFT' },
    isRegistrationTerm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Semester || model<ISemester>('Semester', SemesterSchema);