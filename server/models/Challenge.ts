import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IDailyLog {
  day: number;
  checkInTime: Date;
  reflection?: string;
  urgeLevel?: number;
  mood?: string;
}

export interface IChallenge extends Document {
  user: mongoose.Types.ObjectId;
  userEmail: string;
  startDate: string;
  completedDays: number[];
  dailyLogs: IDailyLog[];
  progressPercent: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString().slice(0, 10),
    },
    completedDays: {
      type: [Number],
      default: [],
    },
    dailyLogs: [
      {
        day: { type: Number, required: true },
        checkInTime: { type: Date, default: Date.now },
        reflection: { type: String, default: '' },
        urgeLevel: { type: Number, default: 0 },
        mood: { type: String, default: 'Neutral' },
      },
    ],
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);
