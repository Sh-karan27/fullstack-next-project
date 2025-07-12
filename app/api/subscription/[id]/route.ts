import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Subscription } from "@/models/Subscription";
import { message } from "antd";
import { error } from "console";

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
    console.log(session, "session for fetch");
    // const currentUserID = session?.user?.id;
    const { id } = await params;
    console.log(id, "id in fetch subs");
    const subscribers = await Subscription.aggregate([
      {
        $match: {
          following: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "user_who_is_following",
        },
      },
      {
        $unwind: "$user_who_is_following", // ✅ flatten the array
      },
      {
        $project: {
          username: "$user_who_is_following.username",
          id: "$user_who_is_following._id",
          _id: 0, // remove the Subscription _id
        },
      },
    ]);

    if (!subscribers) {
      return NextResponse.json({
        error: "Failed to fetch Subscriber",
        status: 404,
      });
    }
    return NextResponse.json({
      message: "Subscriber fetched",
      subscribers,
      status: 200,
    });
  } catch (error) {
    console.log(error);
  }
}
