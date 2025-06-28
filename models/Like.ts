import mongoose, { model, mongo, Schema, Types } from "mongoose";

export interface ILike {
  _id: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  comment: mongoose.Schema.Types.ObjectId;
  video: mongoose.Schema.Types.ObjectId;
  reply: mongoose.Schema.Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replies",
    },
  },
  {
    timestamps: true,
  }
);

export const Like = mongoose.models.Like || model<ILike>("Like", likeSchema);
