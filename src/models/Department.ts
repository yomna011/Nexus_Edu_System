import mongoose, { Schema, model, models } from 'mongoose';

export interface IDepartment {
  name: string;
  code: string;
  college: string;
  headOfDepartment?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    college: { type: String, required: true },
    headOfDepartment: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export default models.Department || model<IDepartment>('Department', DepartmentSchema);