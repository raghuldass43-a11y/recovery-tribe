import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
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
      required: [true, 'Comment cannot be empty'],
      maxlength: [600, 'Comment cannot exceed 600 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
