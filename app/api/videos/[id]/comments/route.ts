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

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const videoComments = await Comment.aggregate([
      {
        $match: {
          videoId: new mongoose.Types.ObjectId(id), // Match by `videoId`
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videoId",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      {
        $unwind: "$videoDetails",
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          comment: 1,
          createdAt: 1,
          updatedAt: 1,
          "videoDetails.title": 1,
          "videoDetails.description": 1,
          "videoDetails.videoUrl": 1,
          "videoDetails.thumbnailUrl": 1,
        },
      },
    ]);

    // console.log('Video Comments:', videoComments);
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
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectToDatabase();

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
      // email: session.user.email,
      // username: session.user.username,
      comment,
      // owner: session.user.id,
      videoId: id,
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
