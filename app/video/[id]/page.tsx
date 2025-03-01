'use client';
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { IVideo } from '@/models/Video';
import { useParams, useRouter } from 'next/navigation';
import { useNotification } from '@/app/components/Notification';

const VideoDetailPage = () => {
  const { id: videoId } = useParams();

  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showNotification } = useNotification();

  console.log(video);
  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        const data = await apiClient.getAVideo(videoId as string);
        setVideo(data);
      } catch (error) {
        setError('Failed to Load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleDelete = async () => {
    const videoId = video?._id?.toString();
    try {
      const data = await apiClient.deleteVideo(videoId as string);
      router.push('/');
      showNotification('Video Delted Successfully!', 'success');
    } catch (error) {
      console.log(error, 'Failed to delete video');
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='max-w-[40vw] h-[50vh] '>
        <video
          src={video?.videoUrl}
          controls
          className='h-full w-full mx-auto rounded-lg shadow-lg'
        />
      </div>
      <div className='flex flex-col items-left justify-center p-4'>
        <h1 className='text-3xl font-bold mb-4'>{video?.title}</h1>
        <p className='mt-4 text-gray-500'>{video?.description}</p>
      </div>
      <div className='flex gap-2'>
        <button className='btn btn-primary' onClick={handleDelete}>
          Delete
        </button>

        <button className='btn btn-primary'>Edit</button>
        <button className='btn btn-primary'>Share</button>
      </div>
    </div>
  );
};

export default VideoDetailPage;
