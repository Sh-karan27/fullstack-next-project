import { connectToDatabase } from '@/lib/db';
import Video from '@/models/Video';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
