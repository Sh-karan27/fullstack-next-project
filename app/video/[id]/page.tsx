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
import { formatTimeAgo } from "@/app/utils/formatTimeAgo";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { BiSolidLike } from "react-icons/bi";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

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
  const [showReplyFiled, setShowReplyField] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [likesOnVideo, setLikesOnVideo] = useState<number | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  type Subscriber = {
    username: string;
    id: string;
  };
  const [subscriber, setSubscriber] = useState<Subscriber[]>([]);

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
    fetchVideoLikes(videoId as string);
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

  const fetchVideoLikes = async (videoId: string) => {
    try {
      const response = await apiClient.fetchLikesForVideo(videoId);
      console.log(response);
      const { likeCount, users, isLiked } = response as {
        likeCount: number;
        users: { username: string; avatar: string }[];
        isLiked: boolean;
      };
      setShowLikes(isLiked);
      setLikesOnVideo(likeCount);
    } catch (error) {
      console.log(error, "error in video page");
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
      await fetchVideoComments();
      setReplyText("");
      setShowReplyField(null);
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
      onClick: () => setShowReplyField(comment._id?.toString()),
    },
  ];

  const handleToggleLike = async () => {
    try {
      const response = (await apiClient.postLike(videoId as string)) as {
        message?: string;
      };
      console.log(response, "like response");
      socket.emit("like-video", videoId);
      // fetchVideo(); // Refresh video data to update likes count
      fetchVideoLikes(videoId as string);
      showNotification(response?.message ?? "Liked!", "success");
    } catch (error) {
      console.error("Failed to like video:", error);
      showNotification("Failed to like video", "error");
    }
  };

  const handleToggleFollow = async () => {
    try {
      const response = (await apiClient.toggleFollow(
        video?.posted_by.id as string
      )) as { message?: string };
      console.log(response, "follow response");
      fetchVideo();
      fetchVideoLikes(videoId as string);
      showNotification(response?.message || "Action completed", "success");
    } catch (error: any) {
      console.log(error, "Failed to toggle follow");
      showNotification(error?.message || "Action completed", "error");
    }
  };

  const fetchUserSubscriber = async (id: string) => {
    try {
      const response = await apiClient.fetchSubscriber(id);
      const { subscribers } = response as { subscribers: Subscriber[] };
      setSubscriber(subscribers);
      console.log(response, "fetchUserSubscriber");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (video) {
      const user_id = video.posted_by.id as string;
      fetchUserSubscriber(user_id);
    }
  }, [video]);

  useEffect(() => {
    socket.on("video-liked", ({ videoId: likedVideoId }) => {
      if (likedVideoId === videoId) {
        fetchVideo();
        fetchVideoLikes(likedVideoId as string);
      }
    });

    return () => {
      socket.off("video-liked");
    };
  }, [videoId]);

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
          <div className="flex items-center gap-4">
            <img
              src={video?.posted_by?.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-col items-center gap-2">
              <p>{video?.posted_by.username}</p>
              <p className=" text-gray-500">{subscriber.length} subscribers</p>
            </div>
          </div>
          {!(session?.user?.id === video?.posted_by?.id) && (
            <button className="btn btn-primary" onClick={handleToggleFollow}>
              {video?.isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          )}
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
        <div className="flex items-center gap-2">
          <BiSolidLike
            style={{
              color: showLikes ? "#fff" : "#777AFA",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={handleToggleLike}
          />

          {(likesOnVideo ?? 0) > 0 && (
            <p style={{ color: "white" }}>{likesOnVideo ?? 0}</p>
          )}
        </div>
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
              className=" flex flex-col sm:flex-row justify-between items-start sm:items-center m-4 p-4 gap-3 border-b"
              key={`${comment._id} + ${index}`}
            >
              <div className="flex items-start justify-center gap-2 flex-col w-full">
                <div className="flex-col items-center  justify-between w-full">
                  <div className="flex items-center justify-center, gap-5">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-bold text-xl text-gray-700">
                      {comment.user.username}
                    </span>
                    <span>{formatTimeAgo(comment?.createdAt)}</span>
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
                  <>
                    <p className="text-sm text-gray-300">{comment.comment}</p>

                    <div className="flex gap-2 flex-col items-start">
                      <div className="flex items-start gap-2">
                        {video &&
                          getCommentActions(
                            comment,
                            session,
                            video,
                            deleteLoader
                          )
                            .filter((action) => action.show)
                            .map((action, i) => (
                              <div
                                key={i}
                                className="tooltip tooltip-top"
                                data-tip={action.name}
                              >
                                <button onClick={action.onClick}>
                                  {action.icon}
                                </button>
                              </div>
                            ))}
                      </div>
                      {(comment.replies ?? []).length > 0 && (
                        <p
                          className="text-sm text-[#777AFA] flex items-center gap-2 cursor-pointer"
                          onClick={() => setShowReplies(!showReplies)}
                        >
                          replies {(comment.replies ?? []).length || ""}{" "}
                          {showReplies ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </p>
                      )}
                      {showReplies && (comment?.replies?.length ?? 0) > 0 && (
                        <div>
                          {(comment?.replies ?? []).map((item, index) => {
                            const username = item?.user?.username || "Unknown";
                            const avatar =
                              item?.user?.avatar ||
                              "https://ui-avatars.com/api/?name=Unknown&background=777aFA&color=fff";

                            return (
                              <div className="mt-5 ml-5" key={index}>
                                <div
                                  key={index}
                                  className="flex items-start justify-center gap-2"
                                >
                                  <img
                                    src={avatar}
                                    alt={username}
                                    className="w-5 h-5 rounded-full"
                                  />
                                  <div className="flex items-start justify-center flex-col gap-1">
                                    <div className="flex items-start justify-center gap-1">
                                      <span className="font-bold text-sm text-gray-700">
                                        @{username}
                                      </span>
                                      <span className="text-sm">
                                        {formatTimeAgo(item?.createdAt)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-sm text-gray-300">
                                        {item.reply}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {showReplyFiled === comment?._id?.toString() && (
                      <div className="flex items-center justify-between w-full gap-2">
                        <input
                          className=" border-gray-300  w-full border-b  bg-transparent focus:outline-none"
                          type="text"
                          placeholder="Add Comment "
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex items-center gap-4">
                          <button
                            className="btn ptn-primary"
                            onClick={() => {
                              handlePostReplyToComment(
                                showReplyFiled,
                                replyText
                              );
                            }}
                            disabled={replyText.trim() === ""}
                          >
                            reply
                          </button>
                          <button
                            className="btn ptn-primary "
                            onClick={() => {
                              setShowReplyField(null);
                              setReplyText("");
                            }}
                          >
                            cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
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
