import mongoose, { Schema, Types, model } from "mongoose";

export interface IReplies {
  _id: Types.ObjectId;
  posted_by: string;
  reply_to: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const replySchema = new Schema<IReplies>(
  {
    posted_by: { type: String, required: true },
    reply_to: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Replies =
  mongoose.models.Replies || model<IReplies>("Replies", replySchema);

export default Replies;
