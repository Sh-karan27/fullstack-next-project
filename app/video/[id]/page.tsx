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
  const [showConfirm, setShowConfirm] = useState(false);
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
        <button
          className='btn btn-primary'
          onClick={() => setShowConfirm(!showConfirm)}>
          Delete
        </button>

        <button className='btn btn-primary'>Edit</button>
        <button className='btn btn-primary'>Share</button>
      </div>
      {/* Confirmation Alert Box */}
      {showConfirm && (
        <div
          role='alert'
          className='alert alert-vertical sm:alert-horizontal absolute top-0 left-0 right-0 mx-auto w-96 bg-base-200 shadow-md z-50'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            className='stroke-info h-6 w-6 shrink-0'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
          </svg>
          <span>Are you sure you want to delete this video?</span>
          <div>
            <button
              className='btn btn-sm'
              onClick={() => setShowConfirm(false)}>
              Cancel
            </button>
            <button
              className='btn btn-sm btn-primary btn-error'
              onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetailPage;
