import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Comment from '@/models/Comment';
import Video from '@/models/Video';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const session = await getServerSession(authOptions);

    // if (
    //   !session ||
    //   !session.user ||
    //   !session.user.email ||
    //   !session.user.username
    // ) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectToDatabase();

    const { id } = await params; // ✅ Fix: Extract `id` properly

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch video' },
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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const deleteVideo = await Video.findByIdAndDelete(id);
    if (!deleteVideo) {
      return NextResponse.json(
        { error: 'Something went wrong while deleting the video ' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Video deleted successfully', deletedVideo: deleteVideo },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete video' },
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
    const { id } = await params;
    const { title, description } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Video id is required' },
        { status: 400 }
      );
    }

    const updateVideo = await Video.findByIdAndUpdate(
      id,
      {
        title,
        description,
      },
      {
        new: true,
      }
    );

    if (!updateVideo) {
      return NextResponse.json(
        { error: 'Unable to update video!' },
        { status: 404 }
      );
    }

    return NextResponse.json(updateVideo, { status: 200 });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
