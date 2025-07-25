import mongoose, { model, models, Schema } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1920,
  height: 1080,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  posted_by: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    weight: number;
    quality?: number;
  };
  isSubscribed?: boolean;
  isLiked?: boolean;
  likesCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    posted_by: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height },
      weight: { type: Number, default: VIDEO_DIMENSIONS.width },
      quality: { type: Number, min: 1, max: 100 },
    },
  },
  {
    timestamps: true,
  }
);

const Video = models?.Video || model<IVideo>("Video", videoSchema);

export default Video;
