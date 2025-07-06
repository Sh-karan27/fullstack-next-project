import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Subscription } from "@/models/Subscription";
import { message } from "antd";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserID = session?.user?.id;
    const { id } = await params;
    console.log("id to follow the user", id);
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid userID" }, { status: 400 });
    }
    if (id.toString() === currentUserID) {
      return NextResponse.json({
        message: "Cant follow you own account",
        status: 404,
      });
    }
    const alreadyFollowing = await Subscription.findOne({
      follower: currentUserID,
      following: id,
    });
    if (alreadyFollowing) {
      const unFollowAlreadyFollowing = await Subscription.findOneAndDelete({
        follower: currentUserID,
        following: id,
      });
      return NextResponse.json({
        message: "Unfollowed",
        unFollowAlreadyFollowing,
      });
    }
    const followUser = await Subscription.create({
      follower: currentUserID,
      following: id,
    });
    return NextResponse.json({
      message: "Following",
      followUser,
    });
  } catch (error) {
    console.log(error);
  }
}
