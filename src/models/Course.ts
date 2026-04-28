import mongoose, { Schema, model, models } from "mongoose";

export interface ICourse {
  code: string;
  title: string;
  creditHours: number;
  type: "CORE" | "ELECTIVE";
  department: mongoose.Types.ObjectId;
  semester?: mongoose.Types.ObjectId;
  schedule?: {
    day: "MON" | "TUE" | "WED" | "THU" | "FRI";
    startTime: string;
    endTime: string;
    room?: string;
  };
  instructor?: mongoose.Types.ObjectId;
  capacity?: number;
  enrolledCount?: number;
  isHonors?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    creditHours: { type: Number, required: true },
    type: { type: String, enum: ["CORE", "ELECTIVE"], required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    semester: { type: Schema.Types.ObjectId, ref: "Semester" },
    schedule: {
      day: { type: String, enum: ["MON", "TUE", "WED", "THU", "FRI"] },
      startTime: String,
      endTime: String,
      room: String,
    },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    capacity: { type: Number, default: 30 },
    enrolledCount: { type: Number, default: 0 },
    isHonors: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CourseSchema.index({ code: 1, semester: 1 }, { unique: true });

export default models.Course || model<ICourse>("Course", CourseSchema);
