import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Schema } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Like } from "@/models/Like";

// TOGGLE POST LIKE

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const session = await getServerSession(authOptions);
//     console.log(session, "session in likes");
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const { id } = await params;
//     console.log("id for like api", id);
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid Video ID" }, { status: 400 });
//     }
//     const like = await Like.findOne({
//       user: new mongoose.Types.ObjectId(session.user.id as string),
//       video: new mongoose.Types.ObjectId(id),
//     });
//     if (like) {
//       const deleteLike = await Like.deleteOne({
//         user: new mongoose.Types.ObjectId(session.user.id as string),
//         video: new mongoose.Types.ObjectId(id),
//       });
//       return NextResponse.json(
//         { message: "Like removed successfully", deleteLike },
//         { status: 200 }
//       );
//     }
//     const postLike = await Like.create({
//       user: new mongoose.Types.ObjectId(session.user.id as string),
//       video: new mongoose.Types.ObjectId(id),
//     });
//     if (!postLike) {
//       NextResponse.json({ error: "Failed to post like" }, { status: 500 });
//     }
//     return NextResponse.json(
//       { message: "Like posted successsfully", postLike },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error in POST /like/:id", error);
//     return NextResponse.json(
//       { error: "Failed to like video" },
//       { status: 500 }
//     );
//   }
// }

// get likes on perticualr video

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

    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Video ID" }, { status: 400 });
    }

    // Check if user already liked the video
    const like = await Like.findOne({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      video: new mongoose.Types.ObjectId(id),
    });

    if (like) {
      // Remove like
      await Like.deleteOne({
        user: new mongoose.Types.ObjectId(session.user.id as string),
        video: new mongoose.Types.ObjectId(id),
      });
    } else {
      // Add new like
      await Like.create({
        user: new mongoose.Types.ObjectId(session.user.id as string),
        video: new mongoose.Types.ObjectId(id),
      });
    }

    // Now fetch updated like count and isLiked info (same aggregation as GET)
    const likeStats = await Like.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: null,
          users: { $push: "$user" },
          likeCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(session.user.id as string),
              "$users",
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          likeCount: 1,
          isLiked: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        message: like
          ? "Like removed successfully"
          : "Like posted successfully",
        likeCount: likeStats[0]?.likeCount || 0,
        isLiked: likeStats[0]?.isLiked || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /like/:id", error);
    return NextResponse.json(
      { error: "Failed to like/unlike video" },
      { status: 500 }
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
    console.log(session, "sessionp in get lieks for perticular video");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    console.log("id for like get likes on perticualr video", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId!");
    }

    // const likesOnVide = await Like.find({ video: id });

    const likesOnVide = await Like.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          username: "$userInfo.username",
          avatar: "$userInfo.avatar",
          userId: "$user", // needed for isLiked
        },
      },
      {
        $group: {
          _id: null,
          users: {
            $push: {
              username: "$username",
              avatar: "$avatar",
              userId: "$userId",
            },
          },
          likeCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(session?.user?.id as string),
              "$users.userId",
            ],
          },
        },
      },
      {
        $project: {
          users: {
            $map: {
              input: "$users",
              as: "u",
              in: {
                username: "$$u.username",
                avatar: "$$u.avatar",
              },
            },
          },
          likeCount: 1,
          isLiked: 1,
        },
      },
    ]);

    if (!likesOnVide) {
      return NextResponse.json(
        {
          error: "Failed to fetch likes",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "Like for video fetched successfully",
        ...likesOnVide[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch likes on  video" },
      { status: 500 }
    );
  }
}
