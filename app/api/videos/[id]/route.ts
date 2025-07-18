import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Comment from "@/models/Comment";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      !session.user.email ||
      !session.user.username
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ✅ Fix: Extract `id` properly

    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // const video = await Video.findById(id).lean();

    const video = await Video.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "subscriptions", // ✅ This matches your collection name
          let: { uploaderId: "$posted_by.id" }, // posted_by.id is string
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$follower",
                        new mongoose.Types.ObjectId(session.user.id as string),
                      ],
                    },
                    { $eq: ["$following", { $toObjectId: "$$uploaderId" }] },
                  ],
                },
              },
            },
          ],
          as: "subscriptionInfo",
        },
      },
      {
        $addFields: {
          isSubscribed: { $gt: [{ $size: "$subscriptionInfo" }, 0] },
        },
      },

      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(session?.user?.id as string),
              "$likes.user",
            ],
          }, // Replace "userId" with the actual user ID from session
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          videoUrl: 1,
          thumbnailUrl: 1,
          controls: 1,
          transformation: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          isLiked: 1,
          isSubscribed: 1,
          posted_by: {
            id: 1,
            username: 1,
            email: 1,
            avatar: 1,
          },
        },
      },
    ]);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    console.log(video[0], "get perticular video");
    return NextResponse.json(video[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const deleteVideo = await Video.findByIdAndDelete(id);
    if (!deleteVideo) {
      return NextResponse.json(
        { error: "Something went wrong while deleting the video " },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Video deleted successfully", deletedVideo: deleteVideo },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { title, description } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Video id is required" },
        { status: 400 }
      );
    }

    const updateVideo = await Video.findByIdAndUpdate(
      id,
      {
        title,
        description,
      },
      {
        new: true,
      }
    );

    if (!updateVideo) {
      return NextResponse.json(
        { error: "Unable to update video!" },
        { status: 404 }
      );
    }

    return NextResponse.json(updateVideo, { status: 200 });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
