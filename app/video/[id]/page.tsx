'use client';
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { IVideo } from '@/models/Video';
import { useParams, useRouter } from 'next/navigation';
import { useNotification } from '@/app/components/Notification';
import { IComment } from '@/models/Comment';

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState<IComment[] | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!videoId) return;

    const fetchVideoComments = async () => {
      try {
        const data = await apiClient.getComments(videoId as string);
        setComments(data.comments);
        console.log(data);
      } catch (error) {
        console.error('Failed to Load comments:', error);
      }
    };

    const fetchVideo = async () => {
      try {
        const data = await apiClient.getAVideo(videoId as string);
        setVideo(data);
        setTitle(data.title);
        setDescription(data.description);
      } catch (error) {
        setError('Failed to Load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
    fetchVideoComments();
  }, [videoId]);

  const handleDelete = async () => {
    const videoId = video?._id?.toString();
    try {
      const data = await apiClient.deleteVideo(videoId as string);
      router.push('/');
      showNotification('Video Deleted Successfully!', 'success');
    } catch (error) {
      console.log(error, 'Failed to delete video');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedVideo = await apiClient.editVideo(videoId as string, {
        title,
        description,
      });
      setVideo(updatedVideo); // Update the video state with the new data
      setShowEditModal(false); // Close the modal
      showNotification('Video Updated Successfully!', 'success');
    } catch (error) {
      console.error('Failed to update video:', error);
      showNotification('Failed to update video', 'error');
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='max-w-[40vw] h-[50vh]'>
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
        <button
          className='btn btn-primary'
          onClick={() => setShowEditModal(true)}>
          Edit
        </button>
        <button className='btn btn-primary'>Share</button>
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Edit Modal */}
      {showEditModal && (
        <dialog id='edit_modal' className='modal modal-open'>
          <div className='modal-box w-11/12 max-w-5xl'>
            <h3 className='font-bold text-lg'>Edit Video Details</h3>
            <form onSubmit={handleEditSubmit}>
              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Title</legend>
                <input
                  type='text'
                  className='input input-bordered w-full'
                  placeholder='Title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </fieldset>
              <fieldset className='fieldset mt-4'>
                <legend className='fieldset-legend'>Description</legend>
                <input
                  type='text'
                  className='input input-bordered w-full'
                  placeholder='Description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </fieldset>
              <div className='modal-action'>
                <button
                  type='button'
                  className='btn'
                  onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type='submit' className='btn btn-primary'>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
      {comments?.map((comment) => (
        <div key={comment._id}>
          <p>{comment.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default VideoDetailPage;
