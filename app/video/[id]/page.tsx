"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/app/components/Notification";
import { IComment } from "@/models/Comment";
import { Modal } from "antd";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { GoReply } from "react-icons/go";

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
  const [commentToEdit, setCommentToEdit] = useState<string | null>(null);
  const [editFieldCommentInput, setEditFieldCommentInput] = useState("");

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

  const handleSaveEdit = async () => {
    if (!commentToEdit || !editFieldCommentInput.trim()) {
      showNotification("Comment field is empty", "error");
      return;
    }
    console.log("Comment to edit:", editFieldCommentInput, commentToEdit);
    try {
      const response = await apiClient.editComment(
        commentToEdit,
        editFieldCommentInput
      );
      console.log(response);
      setCommentToEdit(null);
      setEditFieldCommentInput("");
      fetchVideoComments();
      showNotification("Comment updated!", "success");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showNotification("Failed to update comment", "error");
    }
  };

  const handlePostReplyToComment = async (id: string, reply: string) => {
    try {
      const response = await apiClient.post_reply(id, reply);
      console.log(response, "replied to comment");
    } catch (error) {
      console.log(error);
    }
  };

  const getCommentActions = (
    comment: IComment,
    session: Session | null,
    video: IVideo,
    deleteLoader: string
  ) => [
    {
      name: "Edit",
      show: session?.user?.id === comment.posted_by.toString(),
      icon: (
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
      ),
      onClick: () => {
        setCommentToEdit(comment._id.toString());
        setEditFieldCommentInput(comment.comment);
      },
    },
    {
      name: "Delete",
      show:
        session?.user?.id === comment.posted_by.toString() ||
        session?.user?.id === video?.posted_by.id,
      icon:
        deleteLoader === comment._id.toString() ? (
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
        ),
      onClick: () => deleteComment(comment._id.toString()),
    },
    {
      name: "Reply",
      show: session?.user?.id !== comment.posted_by.toString(),
      icon: <GoReply className="size-[1.2em]" />,
      onClick: () => console.log("Reply to comment:", comment._id),
    },
  ];

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
            <img
              src={session?.user?.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
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
        <ul>
          {comments?.map((comment, index) => (
            <li
              className=" flex flex-col sm:flex-row justify-between items-start sm:items-center m-4 p-4 gap-3 rounded-lg bg-base-100 shadow"
              key={`${comment._id} + ${index}`}
            >
              <div className="flex items-start justify-center gap-2 flex-col w-full">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-bold text-xl text-gray-700">
                      {comment.user.username}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {video &&
                      getCommentActions(comment, session, video, deleteLoader)
                        .filter((action) => action.show)
                        .map((action, i) => (
                          <div
                            key={i}
                            className="tooltip tooltip-top"
                            data-tip={action.name}
                          >
                            <button
                              className="btn btn-square btn-ghost"
                              onClick={action.onClick}
                            >
                              {action.icon}
                            </button>
                          </div>
                        ))}
                  </div>
                </div>
                {commentToEdit === comment._id.toString() ? (
                  <div className="flex items-center justify-between w-full gap-2">
                    <input
                      className=" border-gray-300  w-full border-b  bg-transparent focus:outline-none"
                      type="text"
                      placeholder="Add Comment "
                      value={editFieldCommentInput}
                      onChange={(e) => setEditFieldCommentInput(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <button
                        className="btn ptn-primary"
                        onClick={handleSaveEdit}
                      >
                        save
                      </button>
                      <button
                        className="btn ptn-primary "
                        onClick={() => {
                          setCommentToEdit(null);
                          setEditFieldCommentInput(comment?.comment);
                        }}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">{comment.comment}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoDetailPage;
