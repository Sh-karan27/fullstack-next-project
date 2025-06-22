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

    const videoComments = await Comment.aggregate([
      {
        $match: {
          videoId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "reply_to",
          as: "replies",
        },
      },
      { $unwind: { path: "$replies", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "posted_by",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "users",
          localField: "replies.posted_by",
          foreignField: "_id",
          as: "replies.user",
        },
      },
      {
        $unwind: {
          path: "$replies.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          comment: { $first: "$comment" },
          posted_by: { $first: "$posted_by" },
          videoId: { $first: "$videoId" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          user: { $first: "$user" },
          replies: { $push: "$replies" },
        },
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
          replies: {
            $filter: {
              input: {
                $map: {
                  input: "$replies",
                  as: "reply",
                  in: {
                    $cond: [
                      {
                        $and: [
                          { $ifNull: ["$$reply._id", false] },
                          { $ifNull: ["$$reply.reply", false] },
                          { $ifNull: ["$$reply.posted_by", false] },
                        ],
                      },
                      {
                        _id: "$$reply._id",
                        reply: "$$reply.reply",
                        reply_to: "$$reply.reply_to",
                        posted_by: "$$reply.posted_by",
                        createdAt: "$$reply.createdAt",
                        updatedAt: "$$reply.updatedAt",
                        user: {
                          username: "$$reply.user.username",
                          avatar: "$$reply.user.avatar",
                        },
                      },
                      null,
                    ],
                  },
                },
              },
              as: "reply",
              cond: { $ne: ["$$reply", null] },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
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
