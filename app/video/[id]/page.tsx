"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/app/components/Notification";
import { IComment } from "@/models/Comment";
import { Modal } from "antd";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [deleteLoader, setDeleteLoader] = useState("");
  const video_id = video?._id || null;

  useEffect(() => {
    console.log(session);
  }, [session]);

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

  const deleteComment = async (id: string) => {
    setDeleteLoader(id);
    try {
      const response = await apiClient.deleteComment(id);
      console.log(response);
      await fetchVideoComments();
      setDeleteLoader("");
      showNotification("Comment deleted!", "success");
    } catch (error) {
      console.log(error);
      setDeleteLoader("");
      showNotification("Failed to delete comment", "error");
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
      <div>
        <div className="max-w-4xl w-full mx-auto px-4 mb-6 flex items-center justify-between">
          <div className="text-base text-gray-500 flex items-center gap-2">
            <img src={session?.user?.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
            <p>{video?.posted_by.username}</p>
          </div>
          <button className="btn btn-primary">Follow</button>
        </div>
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
        {session && session.user.id === video?.posted_by.id && (
          <button
            className="btn btn-primary"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            Delete
          </button>
        )}
        {session && session.user.id === video?.posted_by.id && (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (video !== null) {
                setTitle(video?.title);
                setDescription(video?.description);
              }
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
        )}

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
              <div className="flex items-start justify-center gap-2">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-bold text-xl text-gray-700">
                    {comment.user.username}
                    <p className="text-sm text-gray-300">{comment.comment}</p>
                  </span>
                </div>
              </div>
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
                <div className="tooltip tooltip-top" data-tip="Delete">
                  {(session &&
                    session.user.id === comment.posted_by.toString()) ||
                  session?.user.id === video?.posted_by.id ? (
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => deleteComment(comment._id.toString())}
                    >
                      {deleteLoader === comment._id.toString() ? (
                        <span className="loading loading-infinity loading-sm"></span>
                      ) : (
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0h-1.5a1.5 1.5 0 00-3 0H9a1.5 1.5 0 00-3 0H5"
                          />
                        </svg>
                      )}
                    </button>
                  ) : null}
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
