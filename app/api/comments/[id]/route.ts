import { connectToDatabase } from "@/lib/db";
import Comment from "@/models/Comment";
import Video from "@/models/Video";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Validate the comment ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    // Fetch the comment by ID
    const comment = await Comment.findById(id).lean();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ comment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
    const { id } = params; // just get id from params, no await
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      !session.user.email ||
      !session.user.username
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comment: newCommentText } = await request.json();

    console.log(newCommentText, "newCommentText");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    if (!newCommentText) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    console.log(comment, "comment owner");
    console.log(session, "session user id");

    if (comment.posted_by.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    // Update comment text
    comment.comment = newCommentText;
    await comment.save();

    return NextResponse.json(
      { message: "Comment updated successfully", comment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      !session.user.email ||
      !session.user.username
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Fetch the associated video to check if the current user is the video owner
    const video = await Video.findById(comment.videoId);

    if (!video) {
      return NextResponse.json(
        { error: "Associated video not found" },
        { status: 404 }
      );
    }

    // Check if the user is either the comment owner or the video owner
    const isCommentOwner = comment.posted_by.toString() === session.user.id;
    const isVideoOwner = video.posted_by.id === session.user.id;

    if (!isCommentOwner && !isVideoOwner) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
