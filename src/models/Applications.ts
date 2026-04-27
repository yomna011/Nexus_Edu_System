import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

        status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED'],
      default: 'SUBMITTED'
    },

    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
      }
    ],

        submissionDate: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    },

    statusUpdatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model('Application', ApplicationSchema);