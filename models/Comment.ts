import mongoose, { Schema, model, models } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  comment: string;
  posted_by: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  user: {
    username: string;
    avatar: string;
  };
}

const commentSchema = new Schema<IComment>(
  {
    comment: { type: String, required: true },
    posted_by: { type: Schema.Types.ObjectId, ref: "User" },
    videoId: { type: Schema.Types.ObjectId, ref: "Video" },
    user: {
      username: { type: String, required: true },
      avatar: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const Comment = models?.Comment || model<IComment>("Comment", commentSchema);

export default Comment;
