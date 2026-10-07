import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reporterEmail: string;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'user', 'comment'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: [300, 'Reason cannot exceed 300 characters'],
    },
    details: {
      type: String,
      default: '',
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
