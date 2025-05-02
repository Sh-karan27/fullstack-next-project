"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/app/components/Notification";
import { IComment } from "@/models/Comment";
import { Modal } from "antd";

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState<IComment[] | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const [commentInput, setCommentInput] = useState("");
  const video_id = video?._id || null;

  useEffect(() => {
    console.log(comments);
  }, []);

  useEffect(() => {
    if (!videoId) return;

    fetchVideo();
    fetchVideoComments();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const data = await apiClient.getAVideo(videoId as string);
      setVideo(data);
      setTitle(data.title);
      setDescription(data.description);
    } catch (error) {
      setError("Failed to Load video");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoComments = async () => {
    try {
      const data = await apiClient.getComments(videoId as string);
      setComments(data.comments);
      console.log(data);
    } catch (error) {
      console.error("Failed to Load comments:", error);
    }
  };

  const handleDelete = async () => {
    const videoId = video?._id?.toString();
    try {
      const data = await apiClient.deleteVideo(videoId as string);
      router.push("/");
      showNotification("Video Deleted Successfully!", "success");
    } catch (error) {
      console.log(error, "Failed to delete video");
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
      showNotification("Video Updated Successfully!", "success");
    } catch (error) {
      console.error("Failed to update video:", error);
      showNotification("Failed to update video", "error");
    }
  };

  const handleCommentInput = (value: string) => {
    setCommentInput(value);
  };

  const addComment = async (comment: string, videoId: any) => {
    console.log("Comment posted:", { comment: comment, video_id: video });
    if (!commentInput.trim()) return;

    try {
      const response = await apiClient.postComment(videoId as string, comment);
      console.log(response);
      setCommentInput("");
      fetchVideoComments();
      showNotification("Comment added!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Video Player */}
      <div className="max-w-4xl w-full mx-auto h-[60vh] rounded-lg overflow-hidden shadow-lg mb-6">
        <video
          src={video?.videoUrl}
          controls
          className="h-full w-full rounded-lg"
        />
      </div>
      {/* Title and Description */}
      <div className="max-w-4xl w-full mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{video?.title}</h1>
        <p className="text-base text-gray-500 leading-relaxed">
          {video?.description}
        </p>
      </div>
      {/* Action Buttons */}
      <div className="max-w-4xl w-full mx-auto flex gap-4 mt-6 px-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          Delete
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowEditModal(true)}
        >
          Edit
        </button>
        <button className="btn btn-primary">Share</button>
      </div>
      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div
          role="alert"
          className="alert alert-vertical sm:alert-horizontal fixed top-4 left-1/2 -translate-x-1/2 w-96 bg-base-200 shadow-md z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Are you sure you want to delete this video?</span>
          <div className="flex gap-2">
            <button
              className="btn btn-sm"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary btn-error"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <dialog id="edit_modal" className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl space-y-4">
            <h3 className="font-bold text-lg">Edit Video Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="modal-action gap-4">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
      {/* Comments Section */}
      <div className="max-w-4xl w-full mx-auto mt-12 px-4">
        <div className="flex items-center justify-center gap-10 mb-4">
          <input
            className=" border-gray-300 p-4 w-full border-b  bg-transparent focus:outline-none"
            type="text"
            placeholder="Add Comment "
            value={commentInput}
            onChange={(e) => handleCommentInput(e.target.value)}
          />
        </div>
        {commentInput.trim() !== "" && (
          <>
            <div className="flex items-center justify-end w-full mb-5">
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={() => addComment(commentInput, video_id)}
                >
                  Add
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={() => setCommentInput("")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
        <ul className="divide-y divide-gray-300 rounded-lg bg-base-100 shadow">
          {comments?.map((comment, index) => (
            <li
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3"
              key={`${comment._id} + ${index}`}
            >
              <p className="text-sm text-gray-300">{comment.comment}</p>
              <div className="flex">
                {/* Like Button */}
                <div className="tooltip tooltip-top" data-tip="Like">
                  <button className="btn btn-square btn-ghost">
                    <svg
                      className="size-[1.2em]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Reply/Edit Button */}
                <div className="tooltip tooltip-top" data-tip="Edit">
                  <button className="btn btn-square btn-ghost">
                    <svg
                      className="size-[1.2em]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11.5a.5.5 0 00.8.4l4.2-3.2h5a2 2 0 002-2V10m0-5l3 3m0 0l-8 8H9v-3l8-8z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Add Comment Button with Tooltip */}
                <div className="tooltip tooltip-top" data-tip="Add">
                  <button className="btn btn-square btn-ghost">
                    <svg
                      className="size-[1.2em]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoDetailPage;
