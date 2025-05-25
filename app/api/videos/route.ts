import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("q");

    if (searchTerm) {
      const videos = await Video.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!videos || videos.length === 0) {
        return NextResponse.json([], { status: 200 });
      }
      return NextResponse.json(videos, { status: 200 });
    } else {
      const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

      if (!videos || videos.length === 0) {
        return NextResponse.json([], { status: 200 });
      }
      return NextResponse.json(videos);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch video",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: IVideo = await request.json();
    if (
      !body.title ||
      !body.videoUrl ||
      !body.thumbnailUrl ||
      !body.description
    ) {
      return NextResponse.json(
        { error: "Please fill all fields" },
        { status: 400 }
      );
    }
    console.log(session);

    const videoData = {
      title: body.title,
      description: body.description,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
      controls: body.controls ?? true,
      transformation: {
        height: 1920,
        weight: 1080,
        quality: body.transformation?.quality ?? 100,
      },
      posted_by: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
      },
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
