import React from 'react';

const VideoSkeleton = () => {
  return (
    <div className='card bg-base-100 shadow-sm w-full'>
      <figure className='relative aspect-video bg-base-300 animate-pulse'>
        {/* Thumbnail Skeleton */}
        <div className='w-full h-full bg-base-300 rounded-t-md'></div>
      </figure>
      <div className='card-body p-3'>
        {/* Title Skeleton */}
        <div className='h-5 bg-base-300 rounded w-3/4 mb-2'></div>
        {/* Description Skeleton */}
        <div className='h-4 bg-base-300 rounded w-full mb-1'></div>
        <div className='h-4 bg-base-300 rounded w-1/2'></div>
        {/* Buttons Skeleton */}
        <div className='card-actions justify-end mt-2'>
          <div className='h-6 bg-base-300 rounded w-16'></div>
          <div className='h-6 bg-base-300 rounded w-16'></div>
        </div>
      </div>
    </div>
  );
};

export default VideoSkeleton;
