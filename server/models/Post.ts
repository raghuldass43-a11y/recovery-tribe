import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  text: string;
  images: string[];
  category: 'general' | 'challenge' | 'milestone' | 'support' | 'gratitude';
  milestoneDay?: number;
  likedBy: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  shareCount: number;
  isAnonymous: boolean;
  challengePost: boolean;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      maxlength: [2000, 'Post cannot exceed 2000 characters'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['general', 'challenge', 'milestone', 'support', 'gratitude'],
      default: 'general',
    },
    milestoneDay: {
      type: Number,
      default: null,
    },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shareCount: {
      type: Number,
      default: 0,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    challengePost: {
      type: Boolean,
      default: false,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
