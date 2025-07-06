import mongoose, { model, Schema } from "mongoose";

export interface ISubscription {
  _id: mongoose.Schema.Types.ObjectId;
  follower: mongoose.Schema.Types.ObjectId;
  following: mongoose.Schema.Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription =
  mongoose.models.Subscription ||
  model<ISubscription>("Subscription", subscriptionSchema);
