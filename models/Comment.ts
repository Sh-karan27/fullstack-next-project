import mongoose, { Schema, model, models } from 'mongoose';

export interface IComment {
  _id: mongoose.Types.ObjectId;
  comment: string;
  // owner: mongoose.Types.ObjectId;
  // username?: string;
  // email?: string;
  videoId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    comment: { type: String, required: true },
    // owner: { type: Schema.Types.ObjectId, ref: 'User' },
    // username: { type: String, required: true },
    videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
    // email: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Comment = models?.Comment || model<IComment>('Comment', commentSchema);

export default Comment;
