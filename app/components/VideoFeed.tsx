'use client';
import { IVideo } from '@/models/Video';
import VideoComponent from './VideoComponent';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { debounce } from 'lodash';
import VideoSkeleton from '../ui/VideoSkeleton'; // Import the VideoSkeleton component

export default function VideoFeed() {
  const [videos, setVideos] = useState<IVideo[] | null>(null); // Initialize as null to indicate loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setIsLoading(true); // Set loading to true when fetching videos
    try {
      const data = await apiClient.getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  }

  async function searchVideos(query: string) {
    setIsLoading(true); // Set loading to true when searching videos
    try {
      const data = await apiClient.searchVideos(query);
      setVideos(data);
    } catch (error) {
      console.error('Failed to search videos:', error);
    } finally {
      setIsLoading(false); // Set loading to false after searching
    }
  }

  const debouncedSearch = debounce((query: string) => {
    searchVideos(query);
  }, 300);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query); // Update the input field value
    debouncedSearch(query); // Trigger the debounced search
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteVideo(id);
      await fetchVideos(); // Fetch updated list after deletion
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {/* Search Input */}
        <label className='input col-span-full mb-4 flex items-center gap-2 bg-base-200 p-3 rounded-lg'>
          <svg
            className='h-[1em] opacity-50'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'>
            <g
              strokeLinejoin='round'
              strokeLinecap='round'
              strokeWidth='2.5'
              fill='none'
              stroke='currentColor'>
              <circle cx='11' cy='11' r='8'></circle>
              <path d='m21 21-4.3-4.3'></path>
            </g>
          </svg>
          <input
            type='search'
            required
            placeholder='Search'
            className='flex-1 bg-transparent focus:outline-none'
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </label>

        {/* Video Grid Items */}
        {isLoading ? ( // Show skeleton loader while loading
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='flex justify-center'>
              <VideoSkeleton />
            </div>
          ))
        ) : (
          <>
            {videos?.map((video) => (
              <div key={video._id} className='flex justify-center'>
                <VideoComponent video={video} onDelete={handleDelete} />
              </div>
            ))}

            {videos?.length === 0 && (
              <div className='col-span-full text-center py-12'>
                <p className='text-base-content/70'>No videos found</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
