import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Replies from "@/models/Replies";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(session);

    const { id } = await params;
    const { reply } = await request.json();

    if (!reply) {
      return NextResponse.json(
        { error: "reply text is required" },
        { status: 400 }
      );
    }
    console.log(
      reply,
      "reply in routes",
      "comment id:",
      new Types.ObjectId(id.toString())
    );

    const post_reply = await Replies.create({
      posted_by: new Types.ObjectId(session.user.id.toString()),
      reply_to: new Types.ObjectId(id.toString()),
      reply,
    });
    if (!post_reply) {
      return NextResponse.json(
        { error: "Failed to post reply, try again" },
        { status: 500 }
      );
    }
    console.log(post_reply);
    return NextResponse.json(post_reply, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create reply",
      },
      {
        status: 500,
      }
    );
  }
}

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

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const replies = await Replies.aggregate([
      {
        $match: {
          reply_to: id,
        },
      },
      {
        $lookup: {
          from: "users", // collection name in MongoDB
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
          reply: 1,
          reply_to: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            username: "$user.username",
            avatar: "$user.avatar",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json(replies, { status: 200 });
  } catch (error) {
    console.error("GET REPLIES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}
