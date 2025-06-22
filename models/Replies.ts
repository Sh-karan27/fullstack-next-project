import mongoose, { Schema, Types, model } from "mongoose";

export interface IReplies {
  _id: Types.ObjectId;
  posted_by: Types.ObjectId;
  reply_to: Types.ObjectId;
  reply: string;
  createdAt?: Date;
  updatedAt?: Date;
  user: {
    username: string;
    avatar: string;
  };
}

const replySchema = new Schema<IReplies>(
  {
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    reply: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Replies =
  mongoose.models.Replies || model<IReplies>("Replies", replySchema);

export default Replies;
