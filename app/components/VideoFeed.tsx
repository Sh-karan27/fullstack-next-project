'use client';
import { IVideo } from '@/models/Video';
import VideoComponent from './VideoComponent';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface VideoFeedProps {
  videos: IVideo[];
}

export default function VideoFeed() {
  const [videos, setVideos] = useState<IVideo[] | null>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const data = await apiClient.getVideos();
    setVideos(data);
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteVideo(id); // ✅ Delete from DB
      await fetchVideos(); // ✅ Fetch updated list from the backend
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
      {videos?.map((video) => (
        <div key={video._id} className='flex justify-center'>
          {' '}
          {/* ✅ Wrap in a flex container */}
          <VideoComponent video={video} onDelete={handleDelete} />
        </div>
      ))}

      {videos?.length === 0 && (
        <div className='col-span-full text-center py-12'>
          <p className='text-base-content/70'>No videos found</p>
        </div>
      )}
    </div>
  );
}
