import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Like } from "@/models/Like";
import { message } from "antd";
import { error } from "console";
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  console.log(session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Video ID" }, { status: 400 });
  }
  const like = await Like.findOne({
    user: new mongoose.Types.ObjectId(session.user.id as string),
  });

  if (like) {
    const deleteLike = await Like.deleteOne({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      video: new mongoose.Types.ObjectId(id),
    });
    return NextResponse.json(
      {
        message: "Disliked successfully",
        deleteLike,
      },
      { status: 200 }
    );
  }

  const postLike = await Like.create({
    user: new mongoose.Types.ObjectId(session.user.id as string),
    video: new mongoose.Types.ObjectId(id),
  });

  if (!postLike) {
    NextResponse.json({ error: "Failed to post like" }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: "Like posted successsfully",
      postLike,
    },
    { status: 200 }
  );
}
