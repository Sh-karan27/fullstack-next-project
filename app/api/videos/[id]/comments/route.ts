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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // const videoComments = await Comment.aggregate([
    //   {
    //     $match: {
    //       videoId: new mongoose.Types.ObjectId(id), // Match by `videoId`
    //     },
    //   },
    // ]);
    const videoComments = await Comment.aggregate([
      {
        $match: {
          videoId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "replies", // ✅ MongoDB auto-pluralizes collection names
          localField: "_id",
          foreignField: "reply_to",
          as: "replies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "posted_by",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          comment: 1,
          posted_by: 1,
          videoId: 1,
          createdAt: 1,
          updatedAt: 1,
          "user.username": 1,
          "user.avatar": 1,
          replies: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json({ comments: videoComments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const { comment } = await request.json();
    console.log(comment);

    if (!comment) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    const newComment = await Comment.create({
      posted_by: session?.user.id,
      comment,
      videoId: id,
      user: {
        username: session.user.username,
        avatar: session.user.avatar,
      },
    });

    return NextResponse.json(
      { message: "Comment added successfully", comment: newComment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
